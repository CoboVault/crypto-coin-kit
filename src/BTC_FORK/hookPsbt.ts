import {Psbt as PsbtBase} from 'bip174';
import * as varuint from 'bip174/src/lib/converter/varint';
import {
  KeyValue,
  PartialSig,
  PsbtGlobalUpdate,
  PsbtInput,
  PsbtInputUpdate,
  PsbtOutput,
  PsbtOutputUpdate,
  Transaction as ITransaction,
  TransactionFromBuffer,
  TransactionInput,
} from 'bip174/src/lib/interfaces';
import {checkForInput} from 'bip174/src/lib/utils';
import * as bitcoin from 'bitcoinjs-lib';

import {
  address as bitcoinjsAddress,
  crypto,
  ECPair,
  // Network,
  payments,
  Signer,
  SignerAsync,
  Transaction,
  TxInput,
  TxOutput,
} from 'bitcoinjs-lib';

import {reverseBuffer} from '../utils';

import {p2pkh} from './payments/p2pkh';

import {bitcoin as btcNetwork, Network} from './networks';
import {decode, encode} from './script_signature';

/**
 * These are the default arguments for a Psbt instance.
 */
const DEFAULT_OPTS: PsbtOpts = {
  /**
   * A bitcoinjs Network object. This is only used if you pass an `address`
   * parameter to addOutput. Otherwise it is not needed and can be left default.
   */
  network: btcNetwork,
  /**
   * When extractTransaction is called, the fee rate is checked.
   * THIS IS NOT TO BE RELIED ON.
   * It is only here as a last ditch effort to prevent sending a 500 BTC fee etc.
   */
  maximumFeeRate: 5000, // satoshi per byte
};

/**
 * Psbt class can parse and generate a PSBT binary based off of the BIP174.
 * There are 6 roles that this class fulfills. (Explained in BIP174)
 *
 * Creator: This can be done with `new Psbt()`
 * Updater: This can be done with `psbt.addInput(input)`, `psbt.addInputs(inputs)`,
 *   `psbt.addOutput(output)`, `psbt.addOutputs(outputs)` when you are looking to
 *   add new inputs and outputs to the PSBT, and `psbt.updateGlobal(itemObject)`,
 *   `psbt.updateInput(itemObject)`, `psbt.updateOutput(itemObject)`
 *   addInput requires hash: Buffer | string; and index: number; as attributes
 *   and can also include any attributes that are used in updateInput method.
 *   addOutput requires script: Buffer; and value: number; and likewise can include
 *   data for updateOutput.
 *   For a list of what attributes should be what types. Check the bip174 library.
 *   Also, check the integration tests for some examples of usage.
 * Signer: There are a few methods. signAllInputs and signAllInputsAsync, which will search all input
 *   information for your pubkey or pubkeyhash, and only sign inputs where it finds
 *   your info. Or you can explicitly sign a specific input with signInput and
 *   signInputAsync. For the async methods you can create a SignerAsync object
 *   and use something like a hardware wallet to sign with. (You must implement this)
 * Combiner: psbts can be combined easily with `psbt.combine(psbt2, psbt3, psbt4 ...)`
 *   the psbt calling combine will always have precedence when a conflict occurs.
 *   Combine checks if the internal bitcoin transaction is the same, so be sure that
 *   all sequences, version, locktime, etc. are the same before combining.
 * Input Finalizer: This role is fairly important. Not only does it need to construct
 *   the input scriptSigs and witnesses, but it SHOULD verify the signatures etc.
 *   Before running `psbt.finalizeAllInputs()` please run `psbt.validateSignaturesOfAllInputs()`
 *   Running any finalize method will delete any data in the input(s) that are no longer
 *   needed due to the finalized scripts containing the information.
 * Transaction Extractor: This role will perform some checks before returning a
 *   Transaction object. Such as fee rate not being larger than maximumFeeRate etc.
 */
export class HookPsbt {
  public static fromBase64(
    data: string,
    opts: PsbtOptsOptional = {},
  ): HookPsbt {
    const buffer = Buffer.from(data, 'base64');
    return this.fromBuffer(buffer, opts);
  }

  public static fromHex(data: string, opts: PsbtOptsOptional = {}): HookPsbt {
    const buffer = Buffer.from(data, 'hex');
    return this.fromBuffer(buffer, opts);
  }

  public static fromBuffer(
    buffer: Buffer,
    opts: PsbtOptsOptional = {},
  ): HookPsbt {
    const psbtBase = PsbtBase.fromBuffer(buffer, transactionFromBuffer);
    const psbt = new HookPsbt(opts, psbtBase);
    checkTxForDupeIns(psbt.__CACHE.__TX, psbt.__CACHE);
    return psbt;
  }

  private __CACHE: PsbtCache;
  private opts: PsbtOpts;
  private ins: PsbtInputExtended[];

  constructor(
    opts: PsbtOptsOptional = {},
    readonly data: PsbtBase = new PsbtBase(new PsbtTransaction()),
  ) {
    // set defaults
    this.ins = [];
    this.opts = Object.assign({}, DEFAULT_OPTS, opts);
    this.__CACHE = {
      __NON_WITNESS_UTXO_TX_CACHE: [],
      __NON_WITNESS_UTXO_BUF_CACHE: [],
      __TX_IN_CACHE: {},
      __TX: (this.data.globalMap.unsignedTx as PsbtTransaction).tx,
    };
    if (this.data.inputs.length === 0) {
      this.setVersion(2);
    }

    // Make data hidden when enumerating
    const dpew = (
      obj: any,
      attr: string,
      enumerable: boolean,
      writable: boolean,
    ): any =>
      Object.defineProperty(obj, attr, {
        enumerable,
        writable,
      });
    dpew(this, '__CACHE', false, true);
    dpew(this, 'opts', false, true);
  }

  get inputCount(): number {
    return this.data.inputs.length;
  }

  public combine(...those: HookPsbt[]): this {
    this.data.combine(...those.map(o => o.data));
    return this;
  }

  public clone(): HookPsbt {
    // TODO: more efficient cloning
    const res = HookPsbt.fromBuffer(this.data.toBuffer());
    res.opts = JSON.parse(JSON.stringify(this.opts));
    return res;
  }

  public setMaximumFeeRate(satoshiPerByte: number): void {
    check32Bit(satoshiPerByte); // 42.9 BTC per byte IS excessive... so throw
    this.opts.maximumFeeRate = satoshiPerByte;
  }

  public setVersion(version: number): this {
    check32Bit(version);
    checkInputsForPartialSig(this.data.inputs, 'setVersion');
    const c = this.__CACHE;
    c.__TX.version = version;
    c.__EXTRACTED_TX = undefined;
    return this;
  }

  public setLocktime(locktime: number): this {
    check32Bit(locktime);
    checkInputsForPartialSig(this.data.inputs, 'setLocktime');
    const c = this.__CACHE;
    c.__TX.locktime = locktime;
    c.__EXTRACTED_TX = undefined;
    return this;
  }

  public setInputSequence(inputIndex: number, sequence: number): this {
    check32Bit(sequence);
    checkInputsForPartialSig(this.data.inputs, 'setInputSequence');
    const c = this.__CACHE;
    if (c.__TX.ins.length <= inputIndex) {
      throw new Error('Input index too high');
    }
    c.__TX.ins[inputIndex].sequence = sequence;
    c.__EXTRACTED_TX = undefined;
    return this;
  }

  public addInputs(inputDatas: PsbtInputExtended[]): this {
    inputDatas.forEach(inputData => this.addInput(inputData));
    return this;
  }

  public addInput(inputData: PsbtInputExtended): this {
    checkInputsForPartialSig(this.data.inputs, 'addInput');
    const c = this.__CACHE;
    this.data.addInput(inputData);
    const txIn = c.__TX.ins[c.__TX.ins.length - 1];
    checkTxInputCache(c, txIn);

    const inputIndex = this.data.inputs.length - 1;
    const input = this.data.inputs[inputIndex];
    if (input.nonWitnessUtxo) {
      addNonWitnessTxCache(this.__CACHE, input, inputIndex);
    }
    c.__FEE = undefined;
    c.__FEE_RATE = undefined;
    c.__EXTRACTED_TX = undefined;
    this.ins.push(inputData);
    return this;
  }

  public addOutputs(outputDatas: PsbtOutputExtended[]): this {
    outputDatas.forEach(outputData => this.addOutput(outputData));
    return this;
  }

  public addOutput(outputData: PsbtOutputExtended): this {
    checkInputsForPartialSig(this.data.inputs, 'addOutput');
    const {address} = outputData as any;
    if (typeof address === 'string') {
      const {network} = this.opts;
      const script = bitcoinjsAddress.toOutputScript(address, network);
      outputData = Object.assign(outputData, {script});
    }
    const c = this.__CACHE;
    this.data.addOutput(outputData);
    c.__FEE = undefined;
    c.__FEE_RATE = undefined;
    c.__EXTRACTED_TX = undefined;
    return this;
  }

  public extractTransaction(disableFeeCheck?: boolean): Transaction {
    if (!this.data.inputs.every(isFinalized)) {
      throw new Error('Not finalized');
    }
    const c = this.__CACHE;
    if (!disableFeeCheck) {
      checkFees(this, c, this.opts);
    }
    if (c.__EXTRACTED_TX) {
      return c.__EXTRACTED_TX;
    }
    const tx = c.__TX.clone();
    inputFinalizeGetAmts(this.data.inputs, tx, c, true, this.ins);
    return tx;
  }

  public getFeeRate(): number {
    return getTxCacheValue(
      '__FEE_RATE',
      'fee rate',
      this.data.inputs,
      this.__CACHE,
      this.ins,
    )!;
  }

  public getFee(): number {
    return getTxCacheValue(
      '__FEE',
      'fee',
      this.data.inputs,
      this.__CACHE,
      this.ins,
    )!;
  }

  public finalizeAllInputs(): this {
    checkForInput(this.data.inputs, 0); // making sure we have at least one
    range(this.data.inputs.length).forEach(idx => this.finalizeInput(idx));
    return this;
  }

  public finalizeInput(inputIndex: number): this {
    const input = checkForInput(this.data.inputs, inputIndex);
    const {script, isP2SH, isP2WSH, isSegwit} = getScriptFromInput(
      inputIndex,
      input,
      this.__CACHE,
      this.ins,
    );
    if (!script) {
      throw new Error(`No script found for input #${inputIndex}`);
    }

    const scriptType = classifyScript(script);
    if (!canFinalize(input, script, scriptType)) {
      throw new Error(`Can not finalize input #${inputIndex}`);
    }

    checkPartialSigSighashes(input);

    const {finalScriptSig, finalScriptWitness} = getFinalScripts(
      script,
      scriptType,
      input.partialSig!,
      isSegwit,
      isP2SH,
      isP2WSH,
    );

    if (finalScriptSig) {
      this.data.updateInput(inputIndex, {finalScriptSig});
    }
    if (finalScriptWitness) {
      this.data.updateInput(inputIndex, {finalScriptWitness});
    }
    if (!finalScriptSig && !finalScriptWitness) {
      throw new Error(`Unknown error finalizing input #${inputIndex}`);
    }

    // this.data.clearFinalizedInput(inputIndex);
    return this;
  }

  public validateSignaturesOfAllInputs(): boolean {
    checkForInput(this.data.inputs, 0); // making sure we have at least one
    const results = range(this.data.inputs.length).map(idx =>
      this.validateSignaturesOfInput(idx, this.ins[idx].pubkey),
    );
    return results.reduce((final, res) => res === true && final, true);
  }

  public validateSignaturesOfInput(
    inputIndex: number,
    pubkey?: Buffer,
  ): boolean {
    const input = this.data.inputs[inputIndex];
    const partialSig = (input || {}).partialSig;
    if (!input || !partialSig || partialSig.length < 1) {
      throw new Error('No signatures to validate');
    }
    const mySigs = pubkey
      ? partialSig.filter(sig => sig.pubkey.equals(pubkey))
      : partialSig;
    if (mySigs.length < 1) {
      throw new Error('No signatures for this pubkey');
    }
    const results: boolean[] = [];
    let hashCache: Buffer;
    let scriptCache: Buffer;
    let sighashCache: number;
    for (const pSig of mySigs) {
      const sig = decode(pSig.signature);
      const {hash, script} =
        sighashCache! !== sig.hashType
          ? this.getHashAndSignHashType(inputIndex)
          : {hash: hashCache!, script: scriptCache!};
      sighashCache = sig.hashType;
      hashCache = hash;
      // @ts-ignore
      scriptCache = script;
      // @ts-ignore
      checkScriptForPubkey(pSig.pubkey, script, 'verify');
      const keypair = ECPair.fromPublicKey(pSig.pubkey);
      results.push(keypair.verify(hash, sig.signature));
    }
    return results.every(res => res === true);
  }

  public signAllInputsHD(
    hdKeyPair: HDSigner,
    sighashTypes: number[] = [Transaction.SIGHASH_ALL],
  ): this {
    if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
      throw new Error('Need HDSigner to sign input');
    }

    const results: boolean[] = [];
    for (const i of range(this.data.inputs.length)) {
      try {
        this.signInputHD(i, hdKeyPair, sighashTypes);
        results.push(true);
      } catch (err) {
        results.push(false);
      }
    }
    if (results.every(v => v === false)) {
      throw new Error('No inputs were signed');
    }
    return this;
  }

  public signAllInputsHDAsync(
    hdKeyPair: HDSigner | HDSignerAsync,
    sighashTypes: number[] = [Transaction.SIGHASH_ALL],
  ): Promise<void> {
    return new Promise((resolve, reject): any => {
      if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
        return reject(new Error('Need HDSigner to sign input'));
      }

      const results: boolean[] = [];
      const promises: Array<Promise<void>> = [];
      for (const i of range(this.data.inputs.length)) {
        promises.push(
          this.signInputHDAsync(i, hdKeyPair, sighashTypes).then(
            () => {
              results.push(true);
            },
            () => {
              results.push(false);
            },
          ),
        );
      }
      return Promise.all(promises).then(() => {
        if (results.every(v => v === false)) {
          return reject(new Error('No inputs were signed'));
        }
        resolve();
      });
    });
  }

  public signInputHD(
    inputIndex: number,
    hdKeyPair: HDSigner,
    sighashTypes: number[] = [Transaction.SIGHASH_ALL],
  ): this {
    if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
      throw new Error('Need HDSigner to sign input');
    }
    const signers = getSignersFromHD(
      inputIndex,
      this.data.inputs,
      hdKeyPair,
    ) as Signer[];
    signers.forEach(signer => this.signInput(inputIndex, signer, sighashTypes));
    return this;
  }

  public signInputHDAsync(
    inputIndex: number,
    hdKeyPair: HDSigner | HDSignerAsync,
    sighashTypes: number[] = [Transaction.SIGHASH_ALL],
  ): Promise<void> {
    return new Promise((resolve, reject): any => {
      if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
        return reject(new Error('Need HDSigner to sign input'));
      }
      const signers = getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair);
      const promises = signers.map(signer =>
        this.signInputAsync(inputIndex, signer, sighashTypes),
      );
      return Promise.all(promises)
        .then(() => {
          resolve();
        })
        .catch(reject);
    });
  }

  public signAllInputs(
    keyPair: Signer,
    sighashTypes: number[] = [Transaction.SIGHASH_ALL],
  ): this {
    if (!keyPair || !keyPair.publicKey) {
      throw new Error('Need Signer to sign input');
    }

    // TODO: Add a pubkey/pubkeyhash cache to each input
    // as input information is added, then eventually
    // optimize this method.
    const results: boolean[] = [];
    for (const i of range(this.data.inputs.length)) {
      try {
        this.signInput(i, keyPair, sighashTypes);
        results.push(true);
      } catch (err) {
        results.push(false);
      }
    }
    if (results.every(v => v === false)) {
      throw new Error('No inputs were signed');
    }
    return this;
  }

  public signAllInputsAsync(
    keyPair: Signer | SignerAsync,
    sighashTypes: number[] = [Transaction.SIGHASH_ALL],
  ): Promise<void> {
    return new Promise((resolve, reject): any => {
      if (!keyPair || !keyPair.publicKey) {
        return reject(new Error('Need Signer to sign input'));
      }

      // TODO: Add a pubkey/pubkeyhash cache to each input
      // as input information is added, then eventually
      // optimize this method.
      const results: boolean[] = [];
      const promises: Array<Promise<void>> = [];
      for (const [i] of this.data.inputs.entries()) {
        promises.push(
          this.signInputAsync(i, keyPair, sighashTypes).then(
            () => {
              results.push(true);
            },
            () => {
              results.push(false);
            },
          ),
        );
      }
      return Promise.all(promises).then(() => {
        if (results.every(v => v === false)) {
          return reject(new Error('No inputs were signed'));
        }
        resolve();
      });
    });
  }

  public signInput(
    inputIndex: number,
    keyPair: Signer,
    sighashTypes: number[] = [Transaction.SIGHASH_ALL],
  ): this {
    if (!keyPair || !keyPair.publicKey) {
      throw new Error('Need Signer to sign input');
    }
    const {hash, sighashType} = this.getHashAndSignHashType(inputIndex);

    const partialSig = [
      {
        pubkey: keyPair.publicKey,
        signature: encode(
          keyPair.sign(hash),
          sighashType,
          this.opts.network.forkId,
        ),
      },
    ];

    this.data.updateInput(inputIndex, {partialSig});
    return this;
  }

  public signInputAsync(
    inputIndex: number,
    keyPair: Signer | SignerAsync,
    sighashTypes: number[] = [Transaction.SIGHASH_ALL],
  ): Promise<void> {
    return new Promise((resolve, reject): void => {
      if (!keyPair || !keyPair.publicKey) {
        return reject(new Error('Need Signer to sign input'));
      }

      const {hash, sighashType} = this.getHashAndSignHashType(inputIndex);

      Promise.resolve(keyPair.sign(hash)).then(signature => {
        const partialSig = [
          {
            pubkey: keyPair.publicKey,
            signature: encode(signature, sighashType, this.opts.network.forkId),
          },
        ];

        this.data.updateInput(inputIndex, {partialSig});
        resolve();
      });
    });
  }

  public toBuffer(): Buffer {
    return this.data.toBuffer();
  }

  public toHex(): string {
    return this.data.toHex();
  }

  public toBase64(): string {
    return this.data.toBase64();
  }

  public updateGlobal(updateData: PsbtGlobalUpdate): this {
    this.data.updateGlobal(updateData);
    return this;
  }

  public updateInput(inputIndex: number, updateData: PsbtInputUpdate): this {
    this.data.updateInput(inputIndex, updateData);
    if (updateData.nonWitnessUtxo) {
      addNonWitnessTxCache(
        this.__CACHE,
        this.data.inputs[inputIndex],
        inputIndex,
      );
    }
    return this;
  }

  public updateOutput(outputIndex: number, updateData: PsbtOutputUpdate): this {
    this.data.updateOutput(outputIndex, updateData);
    return this;
  }

  public addUnknownKeyValToGlobal(keyVal: KeyValue): this {
    this.data.addUnknownKeyValToGlobal(keyVal);
    return this;
  }

  public addUnknownKeyValToInput(inputIndex: number, keyVal: KeyValue): this {
    this.data.addUnknownKeyValToInput(inputIndex, keyVal);
    return this;
  }

  public addUnknownKeyValToOutput(outputIndex: number, keyVal: KeyValue): this {
    this.data.addUnknownKeyValToOutput(outputIndex, keyVal);
    return this;
  }

  public clearFinalizedInput(inputIndex: number): this {
    this.data.clearFinalizedInput(inputIndex);
    return this;
  }

  private getHashAndSignHashType(inputIndex: number) {
    let hash: Buffer;
    const forkId = this.opts.network.forkId;
    const unsignedTx = this.__CACHE.__TX;
    const input = checkForInput(this.data.inputs, inputIndex);
    const sighashType = input.sighashType || Transaction.SIGHASH_ALL;
    const script = p2pkh({pubkey: this.ins[inputIndex].pubkey}).output;
    if (typeof forkId !== 'undefined' && forkId >= 0) {
      hash = unsignedTx.hashForWitnessV0(
        inputIndex,
        // @ts-ignore
        script,
        this.ins[inputIndex].value,
        sighashType,
      );
    } else {
      // @ts-ignore
      hash = unsignedTx.hashForSignature(inputIndex, script, sighashType);
    }
    return {hash, sighashType, script};
  }
}

interface PsbtCache {
  __NON_WITNESS_UTXO_TX_CACHE: Transaction[];
  __NON_WITNESS_UTXO_BUF_CACHE: Buffer[];
  __TX_IN_CACHE: {[index: string]: number};
  __TX: Transaction;
  __FEE_RATE?: number;
  __FEE?: number;
  __EXTRACTED_TX?: Transaction;
}

interface PsbtOptsOptional {
  network?: Network;
  maximumFeeRate?: number;
}

interface PsbtOpts {
  network: Network;
  maximumFeeRate: number;
}

interface PsbtInputExtended extends PsbtInput, TransactionInput {
  value: number;
  pubkey?: Buffer;
}

type PsbtOutputExtended = PsbtOutputExtendedAddress | PsbtOutputExtendedScript;

interface PsbtOutputExtendedAddress extends PsbtOutput {
  address: string;
  value: number;
}

interface PsbtOutputExtendedScript extends PsbtOutput {
  script: Buffer;
  value: number;
}

interface HDSignerBase {
  /**
   * DER format compressed publicKey buffer
   */
  publicKey: Buffer;
  /**
   * The first 4 bytes of the sha256-ripemd160 of the publicKey
   */
  fingerprint: Buffer;
}

interface HDSigner extends HDSignerBase {
  /**
   * The path string must match /^m(\/\d+'?)+$/
   * ex. m/44'/0'/0'/1/23 levels with ' must be hard derivations
   */
  derivePath(path: string): HDSigner;
  /**
   * Input hash (the "message digest") for the signature algorithm
   * Return a 64 byte signature (32 byte r and 32 byte s in that order)
   */
  sign(hash: Buffer): Buffer;
}

/**
 * Same as above but with async sign method
 */
interface HDSignerAsync extends HDSignerBase {
  derivePath(path: string): HDSignerAsync;
  sign(hash: Buffer): Promise<Buffer>;
}

/**
 * This function is needed to pass to the bip174 base class's fromBuffer.
 * It takes the "transaction buffer" portion of the psbt buffer and returns a
 * Transaction (From the bip174 library) interface.
 */
const transactionFromBuffer: TransactionFromBuffer = (
  buffer: Buffer,
): ITransaction => new PsbtTransaction(buffer);

/**
 * This class implements the Transaction interface from bip174 library.
 * It contains a bitcoinjs-lib Transaction object.
 */
// tslint:disable-next-line:max-classes-per-file
class PsbtTransaction implements ITransaction {
  public tx: Transaction;
  constructor(buffer: Buffer = Buffer.from([2, 0, 0, 0, 0, 0, 0, 0, 0, 0])) {
    this.tx = Transaction.fromBuffer(buffer);
    checkTxEmpty(this.tx);
    Object.defineProperty(this, 'tx', {
      enumerable: false,
      writable: true,
    });
  }

  public getInputOutputCounts(): {
    inputCount: number;
    outputCount: number;
  } {
    return {
      inputCount: this.tx.ins.length,
      outputCount: this.tx.outs.length,
    };
  }

  public addInput(input: any): void {
    if (
      (input as any).hash === undefined ||
      (input as any).index === undefined ||
      (!Buffer.isBuffer((input as any).hash) &&
        typeof (input as any).hash !== 'string') ||
      typeof (input as any).index !== 'number'
    ) {
      throw new Error('Error adding input.');
    }
    const hash =
      typeof input.hash === 'string'
        ? reverseBuffer(Buffer.from(input.hash, 'hex'))
        : input.hash;
    this.tx.addInput(hash, input.index, input.sequence);
  }

  public addOutput(output: any): void {
    if (
      (output as any).script === undefined ||
      (output as any).value === undefined ||
      !Buffer.isBuffer((output as any).script) ||
      typeof (output as any).value !== 'number'
    ) {
      throw new Error('Error adding output.');
    }
    this.tx.addOutput(output.script, output.value);
  }

  public toBuffer(): Buffer {
    return this.tx.toBuffer();
  }
}

function canFinalize(
  input: PsbtInput,
  script: Buffer,
  scriptType: string,
): boolean {
  switch (scriptType) {
    case 'pubkey':
    case 'pubkeyhash':
    case 'witnesspubkeyhash':
      return hasSigs(1, input.partialSig);
    case 'multisig': {
      const p2ms = payments.p2ms({output: script});
      return hasSigs(p2ms.m!, input.partialSig);
    }
    default:
      return false;
  }
}

function hasSigs(neededSigs: number, partialSig?: any[]): boolean {
  if (!partialSig) {
    return false;
  }
  if (partialSig.length > neededSigs) {
    throw new Error('Too many signatures');
  }
  return partialSig.length === neededSigs;
}

function isFinalized(input: PsbtInput): boolean {
  return !!input.finalScriptSig || !!input.finalScriptWitness;
}

function isPaymentFactory(payment: any): (script: Buffer) => boolean {
  return (script: Buffer): boolean => {
    try {
      payment({output: script});
      return true;
    } catch (err) {
      return false;
    }
  };
}
const isP2MS = isPaymentFactory(payments.p2ms);
const isP2PK = isPaymentFactory(payments.p2pk);
const isP2PKH = isPaymentFactory(p2pkh);
const isP2WPKH = isPaymentFactory(payments.p2wpkh);
const isP2WSHScript = isPaymentFactory(payments.p2wsh);

function check32Bit(num: number): void {
  if (
    typeof num !== 'number' ||
    num !== Math.floor(num) ||
    num > 0xffffffff ||
    num < 0
  ) {
    throw new Error('Invalid 32 bit integer');
  }
}

function checkFees(psbt: HookPsbt, cache: PsbtCache, opts: PsbtOpts): void {
  const feeRate = cache.__FEE_RATE || psbt.getFeeRate();
  const vsize = cache.__EXTRACTED_TX!.virtualSize();
  const satoshis = feeRate * vsize;
  if (feeRate >= opts.maximumFeeRate) {
    throw new Error(
      `Warning: You are paying around ${(satoshis / 1e8).toFixed(8)} in ` +
        `fees, which is ${feeRate} satoshi per byte for a transaction ` +
        `with a VSize of ${vsize} bytes (segwit counted as 0.25 byte per ` +
        `byte). Use setMaximumFeeRate method to raise your threshold, or ` +
        `pass true to the first arg of extractTransaction.`,
    );
  }
}

function checkInputsForPartialSig(inputs: PsbtInput[], action: string): void {
  inputs.forEach(input => {
    let throws = false;
    let pSigs: PartialSig[] = [];
    if ((input.partialSig || []).length === 0) {
      if (!input.finalScriptSig && !input.finalScriptWitness) {
        return;
      }
      pSigs = getPsigsFromInputFinalScripts(input);
    } else {
      pSigs = input.partialSig!;
    }
    pSigs.forEach(pSig => {
      const {hashType} = decode(pSig.signature);
      const whitelist: string[] = [];
      const isAnyoneCanPay = hashType & Transaction.SIGHASH_ANYONECANPAY;
      if (isAnyoneCanPay) {
        whitelist.push('addInput');
      }
      const hashMod = hashType & 0x1f;
      switch (hashMod) {
        case Transaction.SIGHASH_ALL:
          break;
        case Transaction.SIGHASH_SINGLE:
        case Transaction.SIGHASH_NONE:
          whitelist.push('addOutput');
          whitelist.push('setInputSequence');
          break;
      }
      if (whitelist.indexOf(action) === -1) {
        throws = true;
      }
    });
    if (throws) {
      throw new Error('Can not modify transaction, signatures exist.');
    }
  });
}

function checkPartialSigSighashes(input: PsbtInput): void {
  if (!input.sighashType || !input.partialSig) {
    return;
  }
  const {partialSig, sighashType} = input;
  partialSig.forEach(pSig => {
    const {hashType} = decode(pSig.signature);
    if (sighashType !== hashType) {
      throw new Error('Signature sighash does not match input sighash type');
    }
  });
}

function checkScriptForPubkey(
  pubkey: Buffer,
  script: Buffer,
  action: string,
): void {
  const pubkeyHash = crypto.hash160(pubkey);

  const decompiled = bitcoin.script.decompile(script);
  if (decompiled === null) {
    throw new Error('Unknown script error');
  }

  const hasKey = decompiled.some(element => {
    if (typeof element === 'number') {
      return false;
    }
    return element.equals(pubkey) || element.equals(pubkeyHash);
  });

  if (!hasKey) {
    throw new Error(
      `Can not ${action} for this input with the key ${pubkey.toString('hex')}`,
    );
  }
}

function checkTxEmpty(tx: Transaction): void {
  const isEmpty = tx.ins.every(
    (input: TxInput) =>
      input.script &&
      input.script.length === 0 &&
      input.witness &&
      input.witness.length === 0,
  );
  if (!isEmpty) {
    throw new Error('Format Error: Transaction ScriptSigs are not empty');
  }
}

function checkTxForDupeIns(tx: Transaction, cache: PsbtCache): void {
  tx.ins.forEach((input: TxInput) => {
    checkTxInputCache(cache, input);
  });
}

function checkTxInputCache(
  cache: PsbtCache,
  input: {hash: Buffer; index: number},
): void {
  const key =
    reverseBuffer(Buffer.from(input.hash)).toString('hex') + ':' + input.index;
  if (cache.__TX_IN_CACHE[key]) {
    throw new Error('Duplicate input detected.');
  }
  cache.__TX_IN_CACHE[key] = 1;
}

function scriptCheckerFactory(
  payment: any,
  paymentScriptName: string,
): (idx: number, spk: Buffer, rs: Buffer) => void {
  return (
    inputIndex: number,
    scriptPubKey: Buffer,
    redeemScript: Buffer,
  ): void => {
    const redeemScriptOutput = payment({
      redeem: {output: redeemScript},
    }).output as Buffer;

    if (!scriptPubKey.equals(redeemScriptOutput)) {
      throw new Error(
        `${paymentScriptName} for input #${inputIndex} doesn't match the scriptPubKey in the prevout`,
      );
    }
  };
}
const checkRedeemScript = scriptCheckerFactory(payments.p2sh, 'Redeem script');
const checkWitnessScript = scriptCheckerFactory(
  payments.p2wsh,
  'Witness script',
);

type TxCacheNumberKey = '__FEE_RATE' | '__FEE';
function getTxCacheValue(
  key: TxCacheNumberKey,
  name: string,
  inputs: PsbtInput[],
  c: PsbtCache,
  psbtExtendInputs: PsbtInputExtended[],
): number | undefined {
  if (!inputs.every(isFinalized)) {
    throw new Error(`PSBT must be finalized to calculate ${name}`);
  }
  if (key === '__FEE_RATE' && c.__FEE_RATE) {
    return c.__FEE_RATE;
  }
  if (key === '__FEE' && c.__FEE) {
    return c.__FEE;
  }
  let tx: Transaction;
  let mustFinalize = true;
  if (c.__EXTRACTED_TX) {
    tx = c.__EXTRACTED_TX;
    mustFinalize = false;
  } else {
    tx = c.__TX.clone();
  }
  inputFinalizeGetAmts(inputs, tx, c, mustFinalize, psbtExtendInputs);
  if (key === '__FEE_RATE') {
    return c.__FEE_RATE!;
  } else if (key === '__FEE') {
    return c.__FEE!;
  }
}

function getFinalScripts(
  script: Buffer,
  scriptType: string,
  partialSig: PartialSig[],
  isSegwit: boolean,
  isP2SH: boolean,
  isP2WSH: boolean,
): {
  finalScriptSig: Buffer | undefined;
  finalScriptWitness: Buffer | undefined;
} {
  let finalScriptSig: Buffer | undefined;
  let finalScriptWitness: Buffer | undefined;

  // Wow, the payments API is very handy
  const payment: payments.Payment = getPayment(script, scriptType, partialSig);
  const p2wsh = !isP2WSH ? null : payments.p2wsh({redeem: payment});
  const p2sh = !isP2SH ? null : payments.p2sh({redeem: p2wsh || payment});

  if (isSegwit) {
    if (p2wsh) {
      finalScriptWitness = witnessStackToScriptWitness(p2wsh.witness!);
    } else {
      finalScriptWitness = witnessStackToScriptWitness(payment.witness!);
    }
    if (p2sh) {
      finalScriptSig = p2sh.input;
    }
  } else {
    if (p2sh) {
      finalScriptSig = p2sh.input;
    } else {
      finalScriptSig = payment.input;
    }
  }
  return {
    finalScriptSig,
    finalScriptWitness,
  };
}

function getHashAndSighashType(
  inputs: PsbtInput[],
  inputIndex: number,
  pubkey: Buffer,
  cache: PsbtCache,
  sighashTypes: number[],
): {
  hash: Buffer;
  sighashType: number;
} {
  const input = checkForInput(inputs, inputIndex);

  const {hash, sighashType, script} = getHashForSig(
    inputIndex,
    input,
    cache,
    pubkey,
    sighashTypes,
  );

  checkScriptForPubkey(pubkey, script, 'sign');
  return {
    hash,
    sighashType,
  };
}

function getHashForSig(
  inputIndex: number,
  input: PsbtInput,
  cache: PsbtCache,
  pubkey: Buffer,
  sighashTypes?: number[],
): {
  script: Buffer;
  hash: Buffer;
  sighashType: number;
} {
  const unsignedTx = cache.__TX;
  const sighashType = input.sighashType || Transaction.SIGHASH_ALL;
  if (sighashTypes && sighashTypes.indexOf(sighashType) < 0) {
    const str = sighashTypeToString(sighashType);
    throw new Error(
      `Sighash type is not allowed. Retry the sign method passing the ` +
        `sighashTypes array of whitelisted types. Sighash type: ${str}`,
    );
  }
  let hash: Buffer;
  let script: Buffer;

  if (input.nonWitnessUtxo) {
    const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(
      cache,
      input,
      inputIndex,
    );

    const prevoutHash = unsignedTx.ins[inputIndex].hash;
    const utxoHash = nonWitnessUtxoTx.getHash();

    // If a non-witness UTXO is provided, its hash must match the hash specified in the prevout
    if (!prevoutHash.equals(utxoHash)) {
      throw new Error(
        `Non-witness UTXO hash for input #${inputIndex} doesn't match the hash specified in the prevout`,
      );
    }

    const prevoutIndex = unsignedTx.ins[inputIndex].index;
    const prevout = nonWitnessUtxoTx.outs[prevoutIndex] as TxOutput;

    if (input.redeemScript) {
      // If a redeemScript is provided, the scriptPubKey must be for that redeemScript
      checkRedeemScript(inputIndex, prevout.script, input.redeemScript);
      script = input.redeemScript;
    } else {
      script = prevout.script;
    }

    if (isP2WSHScript(script)) {
      if (!input.witnessScript) {
        throw new Error('Segwit input needs witnessScript if not P2WPKH');
      }
      checkWitnessScript(inputIndex, script, input.witnessScript);
      hash = unsignedTx.hashForWitnessV0(
        inputIndex,
        input.witnessScript,
        prevout.value,
        sighashType,
      );
      script = input.witnessScript;
    } else if (isP2WPKH(script)) {
      // P2WPKH uses the P2PKH template for prevoutScript when signing
      const signingScript = payments.p2pkh({hash: script.slice(2)}).output!;
      hash = unsignedTx.hashForWitnessV0(
        inputIndex,
        signingScript,
        prevout.value,
        sighashType,
      );
    } else {
      hash = unsignedTx.hashForSignature(inputIndex, script, sighashType);
    }
  } else if (input.witnessUtxo) {
    // tslint:disable-next-line:variable-name
    let _script: Buffer; // so we don't shadow the `let script` above
    if (input.redeemScript) {
      // If a redeemScript is provided, the scriptPubKey must be for that redeemScript
      checkRedeemScript(
        inputIndex,
        input.witnessUtxo.script,
        input.redeemScript,
      );
      _script = input.redeemScript;
    } else {
      _script = input.witnessUtxo.script;
    }
    if (isP2WPKH(_script)) {
      // P2WPKH uses the P2PKH template for prevoutScript when signing
      const signingScript = payments.p2pkh({hash: _script.slice(2)}).output!;
      hash = unsignedTx.hashForWitnessV0(
        inputIndex,
        signingScript,
        input.witnessUtxo.value,
        sighashType,
      );
      script = _script;
    } else if (isP2WSHScript(_script)) {
      if (!input.witnessScript) {
        throw new Error('Segwit input needs witnessScript if not P2WPKH');
      }
      checkWitnessScript(inputIndex, _script, input.witnessScript);
      hash = unsignedTx.hashForWitnessV0(
        inputIndex,
        input.witnessScript,
        input.witnessUtxo.value,
        sighashType,
      );
      // want to make sure the script we return is the actual meaningful script
      script = input.witnessScript;
    } else {
      throw new Error(
        `Input #${inputIndex} has witnessUtxo but non-segwit script: ` +
          `${_script.toString('hex')}`,
      );
    }
  } else {
    throw new Error('Need a Utxo input item for signing');
  }
  return {
    script,
    sighashType,
    hash,
  };
}

function getPayment(
  script: Buffer,
  scriptType: string,
  partialSig: PartialSig[],
): payments.Payment {
  let payment: payments.Payment;
  switch (scriptType) {
    case 'multisig': {
      const sigs = getSortedSigs(script, partialSig);
      payment = payments.p2ms({
        output: script,
        signatures: sigs,
      });
      break;
    }
    case 'pubkey':
      payment = payments.p2pk({
        output: script,
        signature: partialSig[0].signature,
      });
      break;
    case 'pubkeyhash':
      payment = p2pkh({
        output: script,
        pubkey: partialSig[0].pubkey,
        signature: partialSig[0].signature,
      });
      break;
    case 'witnesspubkeyhash':
      payment = payments.p2wpkh({
        output: script,
        pubkey: partialSig[0].pubkey,
        signature: partialSig[0].signature,
      });
      break;
  }
  return payment!;
}

function getPsigsFromInputFinalScripts(input: PsbtInput): PartialSig[] {
  const scriptItems = !input.finalScriptSig
    ? []
    : bitcoin.script.decompile(input.finalScriptSig) || [];
  const witnessItems = !input.finalScriptWitness
    ? []
    : bitcoin.script.decompile(input.finalScriptWitness) || [];
  return scriptItems
    .concat(witnessItems)
    .filter(item => {
      return (
        Buffer.isBuffer(item) && bitcoin.script.isCanonicalScriptSignature(item)
      );
    })
    .map(sig => ({signature: sig})) as PartialSig[];
}

interface GetScriptReturn {
  script: Buffer | null;
  isSegwit: boolean;
  isP2SH: boolean;
  isP2WSH: boolean;
}
function getScriptFromInput(
  inputIndex: number,
  input: PsbtInput,
  cache: PsbtCache,
  ins: PsbtInputExtended[],
): GetScriptReturn {
  const unsignedTx = cache.__TX;
  const res: GetScriptReturn = {
    script: null,
    isSegwit: false,
    isP2SH: false,
    isP2WSH: false,
  };
  res.isP2SH = !!input.redeemScript;
  res.isP2WSH = !!input.witnessScript;
  if (input.witnessScript) {
    res.script = input.witnessScript;
  } else if (input.redeemScript) {
    res.script = input.redeemScript;
  } else {
    if (ins[inputIndex].pubkey) {
      // @ts-ignore
      res.script = p2pkh({pubkey: ins[inputIndex].pubkey}).output;
    } else if (input.nonWitnessUtxo) {
      const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(
        cache,
        input,
        inputIndex,
      );
      const prevoutIndex = unsignedTx.ins[inputIndex].index;
      res.script = nonWitnessUtxoTx.outs[prevoutIndex].script;
    } else if (input.witnessUtxo) {
      res.script = input.witnessUtxo.script;
    }
  }
  if (input.witnessScript || isP2WPKH(res.script!)) {
    res.isSegwit = true;
  }
  return res;
}

function getSignersFromHD(
  inputIndex: number,
  inputs: PsbtInput[],
  hdKeyPair: HDSigner | HDSignerAsync,
): Array<Signer | SignerAsync> {
  const input = checkForInput(inputs, inputIndex);
  if (!input.bip32Derivation || input.bip32Derivation.length === 0) {
    throw new Error('Need bip32Derivation to sign with HD');
  }
  const myDerivations = input.bip32Derivation
    .map(bipDv => {
      if (bipDv.masterFingerprint.equals(hdKeyPair.fingerprint)) {
        return bipDv;
      } else {
        return;
      }
    })
    .filter(v => !!v);
  if (myDerivations.length === 0) {
    throw new Error(
      'Need one bip32Derivation masterFingerprint to match the HDSigner fingerprint',
    );
  }
  const signers: Array<Signer | SignerAsync> = myDerivations.map(bipDv => {
    const node = hdKeyPair.derivePath(bipDv!.path);
    if (!bipDv!.pubkey.equals(node.publicKey)) {
      throw new Error('pubkey did not match bip32Derivation');
    }
    return node;
  });
  return signers;
}

function getSortedSigs(script: Buffer, partialSig: PartialSig[]): Buffer[] {
  const p2ms = payments.p2ms({output: script});
  // for each pubkey in order of p2ms script
  return p2ms
    .pubkeys!.map(pk => {
      // filter partialSig array by pubkey being equal
      return (
        partialSig.filter(ps => {
          return ps.pubkey.equals(pk);
        })[0] || {}
      ).signature;
      // Any pubkey without a match will return undefined
      // this last filter removes all the undefined items in the array.
    })
    .filter(v => !!v);
}

function scriptWitnessToWitnessStack(buffer: Buffer): Buffer[] {
  let offset = 0;

  function readSlice(n: number): Buffer {
    offset += n;
    return buffer.slice(offset - n, offset);
  }

  function readVarInt(): number {
    const vi = varuint.decode(buffer, offset);
    offset += (varuint.decode as any).bytes;
    return vi;
  }

  function readVarSlice(): Buffer {
    return readSlice(readVarInt());
  }

  function readVector(): Buffer[] {
    const count = readVarInt();
    const vector: Buffer[] = [];
    for (let i = 0; i < count; i++) {
      vector.push(readVarSlice());
    }
    return vector;
  }

  return readVector();
}

function sighashTypeToString(sighashType: number): string {
  let text =
    sighashType & Transaction.SIGHASH_ANYONECANPAY
      ? 'SIGHASH_ANYONECANPAY | '
      : '';
  const sigMod = sighashType & 0x1f;
  switch (sigMod) {
    case Transaction.SIGHASH_ALL:
      text += 'SIGHASH_ALL';
      break;
    case Transaction.SIGHASH_SINGLE:
      text += 'SIGHASH_SINGLE';
      break;
    case Transaction.SIGHASH_NONE:
      text += 'SIGHASH_NONE';
      break;
  }
  return text;
}

function witnessStackToScriptWitness(witness: Buffer[]): Buffer {
  let buffer = Buffer.allocUnsafe(0);

  function writeSlice(slice: Buffer): void {
    buffer = Buffer.concat([buffer, Buffer.from(slice)]);
  }

  function writeVarInt(i: number): void {
    const currentLen = buffer.length;
    const varintLen = varuint.encodingLength(i);

    buffer = Buffer.concat([buffer, Buffer.allocUnsafe(varintLen)]);
    varuint.encode(i, buffer, currentLen);
  }

  function writeVarSlice(slice: Buffer): void {
    writeVarInt(slice.length);
    writeSlice(slice);
  }

  function writeVector(vector: Buffer[]): void {
    writeVarInt(vector.length);
    vector.forEach(writeVarSlice);
  }

  writeVector(witness);

  return buffer;
}

function addNonWitnessTxCache(
  cache: PsbtCache,
  input: PsbtInput,
  inputIndex: number,
): void {
  cache.__NON_WITNESS_UTXO_BUF_CACHE[inputIndex] = input.nonWitnessUtxo!;

  const tx = Transaction.fromBuffer(input.nonWitnessUtxo!);
  cache.__NON_WITNESS_UTXO_TX_CACHE[inputIndex] = tx;

  const self = cache;
  const selfIndex = inputIndex;
  delete input.nonWitnessUtxo;
  Object.defineProperty(input, 'nonWitnessUtxo', {
    enumerable: true,
    get(): Buffer {
      const buf = self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex];
      const txCache = self.__NON_WITNESS_UTXO_TX_CACHE[selfIndex];
      if (buf !== undefined) {
        return buf;
      } else {
        const newBuf = txCache.toBuffer();
        self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = newBuf;
        return newBuf;
      }
    },
    set(data: Buffer): void {
      self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = data;
    },
  });
}

function inputFinalizeGetAmts(
  inputs: PsbtInput[],
  tx: Transaction,
  cache: PsbtCache,
  mustFinalize: boolean,
  psbtExtendInputs: PsbtInputExtended[],
): void {
  let inputAmount = 0;
  inputs.forEach((input, idx) => {
    if (mustFinalize && input.finalScriptSig) {
      tx.ins[idx].script = input.finalScriptSig;
    }
    if (mustFinalize && input.finalScriptWitness) {
      tx.ins[idx].witness = scriptWitnessToWitnessStack(
        input.finalScriptWitness,
      );
    }
    if (input.witnessUtxo) {
      inputAmount += input.witnessUtxo.value;
    } else if (input.nonWitnessUtxo) {
      const nwTx = nonWitnessUtxoTxFromCache(cache, input, idx);
      const vout = tx.ins[idx].index;
      const out = nwTx.outs[vout] as TxOutput;
      inputAmount += out.value;
    } else {
      inputAmount += psbtExtendInputs[idx].value;
    }
  });
  const outputAmount = (tx.outs as TxOutput[]).reduce(
    (total, o) => total + o.value,
    0,
  );
  const fee = inputAmount - outputAmount;
  if (fee < 0) {
    throw new Error('Outputs are spending more than Inputs');
  }
  const bytes = tx.virtualSize();
  cache.__FEE = fee;
  cache.__EXTRACTED_TX = tx;
  cache.__FEE_RATE = Math.floor(fee / bytes);
}

function nonWitnessUtxoTxFromCache(
  cache: PsbtCache,
  input: PsbtInput,
  inputIndex: number,
): Transaction {
  const c = cache.__NON_WITNESS_UTXO_TX_CACHE;
  if (!c[inputIndex]) {
    addNonWitnessTxCache(cache, input, inputIndex);
  }
  return c[inputIndex];
}

function classifyScript(script: Buffer): string {
  if (isP2WPKH(script)) {
    return 'witnesspubkeyhash';
  }
  if (isP2PKH(script)) {
    return 'pubkeyhash';
  }
  if (isP2MS(script)) {
    return 'multisig';
  }
  if (isP2PK(script)) {
    return 'pubkey';
  }
  return 'nonstandard';
}

function range(n: number): number[] {
  return [...Array(n).keys()];
}
