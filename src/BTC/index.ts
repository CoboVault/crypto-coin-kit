import {decode as bech32Decode} from 'bech32';
import * as bitcoin from 'bitcoinjs-lib';
import {Psbt} from 'bitcoinjs-lib';
import {Output} from 'bitcoinjs-lib/types/transaction';
// @ts-ignore
import bs58check from 'bs58check';
import {Buffer as SafeBuffer} from 'safe-buffer';
import {UtxoCoin} from '../Common/coin';
import {KeyProvider, KeyProviderSync} from '../Common/sign';
import {hash256, numberToHex} from '../utils';
import PsbtBuilder from './txBuilder';

export enum AddressType {
  P2PKH = 'P2PKH',
  P2SH = 'P2SH',
  P2WPKH = 'P2WPKH',
}

export enum NetWorkType {
  mainNet = 'mainNet',
  testNet = 'testNet',
}

export interface TxOutputItem {
  address: string;
  value: number;
}

export interface WitnessUtxo {
  publicKey: string;
  script?: string;
  value: number;
}

export interface MultiSignWitnessUtxo {
  publicKeys: string[];
  script?: string;
  value: number;
}

export interface NonWitnessUtxo {
  nonWitnessUtxo: string;
  value: number;
}

export interface TxInputItem {
  hash: string;
  index: number;
  sequence?: number;
  utxo: WitnessUtxo | NonWitnessUtxo;
  bip32Derivation: Array<{
    pubkey: Buffer;
    masterFingerprint: Buffer;
    path: string;
  }>;
}

export interface MultiSignTxInputItem {
  hash: string;
  index: number;
  sequence?: number;
  utxo: NonWitnessUtxo | MultiSignWitnessUtxo;
}

export interface Destination {
  to: string;
  amount: number; // sat unit
  fee: number;
  changeAddress: string;
}

export interface TxData {
  inputs: TxInputItem[];
  outputs: TxOutputItem[] | Destination;
  version?: number;
  locktime?: number;
}

export interface MultiSignTxData {
  requires: number;
  inputs: MultiSignTxInputItem[];
  outputs: TxOutputItem[] | Destination;
  version?: number;
  locktime?: number;
}

export interface MultiSignOmniTxData {
  requires: number;
  inputs: MultiSignTxInputItem[];
  to: string;
  fee: number;
  changeAddress: string;
  omniAmount: number; // sat unit
  propertyId?: number;
}

export interface OmniTxData {
  inputs: TxInputItem[];
  to: string;
  fee: number;
  changeAddress: string;
  omniAmount: number; // sat unit
  propertyId?: number;
}

export class BTC implements UtxoCoin {
  public static getPsbtTxId = (thatPsbt: Psbt): string => {
    try {
      let canGetFromUnsignedPsbt = true;
      let isFinalized = true;
      const psbt = thatPsbt.clone();
      psbt.data.inputs.forEach((each, index) => {
        const {
          witnessScript,
          redeemScript,
          finalScriptSig,
          finalScriptWitness,
        } = each;
        if (witnessScript && redeemScript) {
          // @ts-ignore
          psbt.data.globalMap.unsignedTx.tx.ins[
            index
          ].script = bitcoin.script.fromASM(redeemScript.toString('hex'));
        } else if (redeemScript) {
          let isP2wpkh = false;
          let isP2wsh = false;
          try {
            bitcoin.payments.p2wpkh({output: redeemScript});
            isP2wpkh = true;
          } catch (e) {}
          try {
            bitcoin.payments.p2wsh({output: redeemScript});
            isP2wsh = true;
          } catch (e) {}
          if (isP2wpkh || isP2wsh) {
            // @ts-ignore
            psbt.data.globalMap.unsignedTx.tx.ins[
              index
            ].script = bitcoin.script.fromASM(redeemScript.toString('hex'));
          } else {
            canGetFromUnsignedPsbt = false;
          }
        } else if (finalScriptSig || finalScriptWitness) {
          isFinalized = isFinalized && true;
          canGetFromUnsignedPsbt = false;
        }
      });
      if (canGetFromUnsignedPsbt) {
        // @ts-ignore
        return psbt.data.globalMap.unsignedTx.tx
          .getHash(true)
          .reverse()
          .toString('hex');
      } else {
        if (isFinalized) {
          return psbt.extractTransaction().getId();
        }
        if (psbt.validateSignaturesOfAllInputs()) {
          psbt.finalizeAllInputs();
          return psbt.extractTransaction().getId();
        } else {
          return '';
        }
      }
    } catch (e) {
      return '';
    }
  };
  protected network: bitcoin.Network;
  constructor(networkType: NetWorkType = NetWorkType.mainNet) {
    if (networkType === NetWorkType.mainNet) {
      this.network = bitcoin.networks.bitcoin;
    } else {
      this.network = bitcoin.networks.testnet;
    }
  }

  public generateAddress(
    publicKey: string,
    addressType: AddressType = AddressType.P2SH,
  ) {
    let btcAddress: string | undefined;
    const pubkeyBuffer = (SafeBuffer.from(
      publicKey,
      'hex',
    ) as unknown) as Buffer;
    if (addressType === AddressType.P2PKH) {
      const {address} = bitcoin.payments.p2pkh({
        pubkey: pubkeyBuffer,
        network: this.network,
      });
      btcAddress = address;
    }
    if (addressType === AddressType.P2SH) {
      const {address} = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
          pubkey: pubkeyBuffer,
          network: this.network,
        }),
        network: this.network,
      });
      btcAddress = address;
    }
    if (addressType === AddressType.P2WPKH) {
      const {address} = bitcoin.payments.p2wpkh({
        pubkey: pubkeyBuffer,
        network: this.network,
      });
      btcAddress = address;
    }

    if (btcAddress) {
      return btcAddress;
    } else {
      throw new Error('generate address failed');
    }
  }

  public generateMultiSignAddress(publicKeys: string[], requires: number) {
    const pubkeysBuffer = publicKeys.map(pubkey => {
      return (SafeBuffer.from(pubkey, 'hex') as unknown) as Buffer;
    });

    const p2ms = bitcoin.payments.p2ms({
      m: requires,
      pubkeys: pubkeysBuffer,
      network: this.network,
    });
    const p2wsh = bitcoin.payments.p2wsh({
      redeem: p2ms,
      network: this.network,
    });
    const p2sh = bitcoin.payments.p2sh({
      redeem: p2wsh,
      network: this.network,
    });

    const btcAddress = p2sh.address;
    if (btcAddress) {
      return btcAddress;
    } else {
      throw new Error('generate address failed');
    }
  }

  public isAddressValid(address: string) {
    if (
      address.startsWith('1') ||
      address.startsWith('3') ||
      address.startsWith('2')
    ) {
      try {
        bs58check.decode(address);
        return true;
      } catch (e) {
        return false;
      }
    } else if (address.startsWith('bc') || address.startsWith('tb')) {
      try {
        bech32Decode(address);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  }

  public async generateTransaction(txData: TxData, signers: KeyProvider[], disableLargeFee = true) {
    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder
      .addInputsForPsbt(txData, disableLargeFee)
      .addOutputForPsbt(txData)
      .getPsbt();

    if (txData.locktime) {
      psbt.setLocktime(txData.locktime);
    }

    if (txData.version) {
      psbt.setVersion(txData.version);
    }
    await this.signAllInputsAsync(signers, psbt);
    return this.extractTx(psbt);
  }

  public generateOmniTransaction = async (
    omniTxData: OmniTxData,
    signers: KeyProvider[],
  ) => {
    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder
      .addOmniInputsForPsbt(omniTxData)
      .addOmniOutputsForPsbt(omniTxData)
      .getPsbt();
    await this.signAllInputsAsync(signers, psbt);
    return this.extractTx(psbt);
  };

  public generateTransactionSync(txData: TxData, signers: KeyProviderSync[], disableLargeFee= true) {
    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder
      .addInputsForPsbt(txData, disableLargeFee)
      .addOutputForPsbt(txData)
      .getPsbt();
    if (txData.locktime) {
      psbt.setLocktime(txData.locktime);
    }
    if (txData.version) {
      psbt.setVersion(txData.version);
    }
    this.signAllInputsSync(signers, psbt);
    return this.extractTx(psbt);
  }

  public generateOmniTransactionSync = (
    omniTxData: OmniTxData,
    signers: KeyProviderSync[],
  ) => {
    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder
      .addOmniInputsForPsbt(omniTxData)
      .addOmniOutputsForPsbt(omniTxData)
      .getPsbt();
    this.signAllInputsSync(signers, psbt);
    return this.extractTx(psbt);
  };

  public async generateMultiSignTransaction(
    txData: MultiSignTxData,
    signers: KeyProvider[],
  ) {
    const psbt = await this.psbtSignMultiSignTx(txData, signers);
    return this.extractTx(psbt);
  }

  public generateMultiSignTransactionSync(
    txData: MultiSignTxData,
    signers: KeyProviderSync[],
  ) {
    const psbt = this.psbtSignMultiSignTxSync(txData, signers);
    return this.extractTx(psbt);
  }

  public async generateOmniMultiSignTransaction(
    txData: MultiSignOmniTxData,
    signers: KeyProvider[],
  ) {
    const psbt = await this.psbtSignOmniMultiSignTx(txData, signers);
    return this.extractTx(psbt);
  }

  public generateOmniMultiSignTransactionSync(
    txData: MultiSignOmniTxData,
    signers: KeyProviderSync[],
  ) {
    const psbt = this.psbtSignOmniMultiSignTxSync(txData, signers);
    return this.extractTx(psbt);
  }

  public async getMultiSignTransactionSignature(
    txData: MultiSignTxData,
    signers: KeyProvider[],
  ) {
    const psbt = await this.psbtSignMultiSignTx(txData, signers);
    return this.extractMultiSignSignatures(psbt);
  }

  public getMultiSignTransactionSignatureSync(
    txData: MultiSignTxData,
    signers: KeyProviderSync[],
  ) {
    const psbt = this.psbtSignMultiSignTxSync(txData, signers);
    return this.extractMultiSignSignatures(psbt);
  }

  public async getOmniMultiSignTransactionSignature(
    txData: MultiSignOmniTxData,
    signers: KeyProvider[],
  ) {
    const psbt = await this.psbtSignOmniMultiSignTx(txData, signers);
    return this.extractMultiSignSignatures(psbt);
  }

  public getOmniMultiSignTransactionSignatureSync(
    txData: MultiSignOmniTxData,
    signers: KeyProviderSync[],
  ) {
    const psbt = this.psbtSignOmniMultiSignTxSync(txData, signers);
    return this.extractMultiSignSignatures(psbt);
  }

  public parseTxHex = (txHex: string) => {
    return bitcoin.Transaction.fromHex(txHex);
  };

  public signMessage = async (message: string, signer: KeyProvider) => {
    const hashHex = this.constructMessageHash(message);
    const {r, s} = await signer.sign(hashHex);
    return `${r}${s}`;
  };

  public signMessageSync = (message: string, signerSync: KeyProviderSync) => {
    const hashHex = this.constructMessageHash(message);
    const {r, s} = signerSync.sign(hashHex);
    return `${r}${s}`;
  };

  public generatePsbt = (txData: TxData, disableLargeFee= true): string => {
    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder
      .addInputsForPsbt(txData, disableLargeFee)
      .addOutputForPsbt(txData)
      .getPsbt();
    return psbt.toBase64();
  };

  public parsePsbt = (psbtString: string) => {
    const psbt = bitcoin.Psbt.fromBase64(psbtString);
    const txBuffer = psbt.data.getTransaction();
    const tx = bitcoin.Transaction.fromBuffer(txBuffer);
    const inputs = tx.ins.map((each, index) => {
      const psbtInput = psbt.data.inputs[index];
      const {
        witnessUtxo,
        nonWitnessUtxo,
        finalScriptWitness,
        finalScriptSig,
        bip32Derivation,
        partialSig,
        redeemScript,
        witnessScript,
      } = psbtInput;
      if (!bip32Derivation) {
        throw new Error('invalid psbt, no bip32Derivation found');
      }
      if (!nonWitnessUtxo && !witnessUtxo) {
        throw new Error('invalid psbt, no utxo found');
      }
      let value = 0;
      let inputScript = null;
      let p2ms = null;
      if (redeemScript) {
        inputScript = redeemScript;
      }
      if (witnessScript) {
        inputScript = witnessScript;
      }
      if (nonWitnessUtxo) {
        const transaction = bitcoin.Transaction.fromBuffer(nonWitnessUtxo);
        const out = transaction.outs[each.index] as Output;
        value = out.value;
        if (!inputScript) {
          inputScript = out.script;
        }
      }
      if (witnessUtxo) {
        value = witnessUtxo.value;
        if (!inputScript) {
          inputScript = witnessUtxo.script;
        }
      }

      try {
        // @ts-ignore
        p2ms = bitcoin.payments.p2ms({output: inputScript});
      } catch (e) {
        // @ts-ignore
      }

      return {
        txId: each.hash.reverse().toString('hex'),
        index: each.index,
        value,
        hdPath: bip32Derivation.map(item => {
          return {
            masterFingerprint: item.masterFingerprint.toString('hex'),
            path: item.path,
            pubkey: item.pubkey.toString('hex'),
          };
        }),
        isMultiSign: !!p2ms,
        signStatus: p2ms
          ? `${partialSig ? partialSig.length : 0}-${p2ms.m}-${p2ms.n}`
          : undefined,
        isFinalized: !!finalScriptSig || !!finalScriptWitness,
      };
    });
    const outputs = tx.outs.map((each, index) => {
      const address = bitcoin.address.fromOutputScript(
        each.script,
        this.network,
      );
      const bip32Derivation = psbt.data.outputs[index].bip32Derivation;
      const eachOutput = each as bitcoin.TxOutput;
      const value = eachOutput.value;
      return {
        address,
        value,
        hdPath:
          bip32Derivation &&
          bip32Derivation.map(item => {
            return {
              masterFingerprint: item.masterFingerprint.toString('hex'),
              path: item.path,
              pubkey: item.pubkey.toString('hex'),
            };
          }),
      };
    });
    return {
      inputs,
      outputs,
    };
  };

  public signPSBTHex = async (psbtString: string, signers: KeyProvider[]) => {
    const psbt = await this.getSignedPSBT(psbtString, signers);
    return this.extractTx(psbt);
  };

  public signPSBTHexSync = (psbtString: string, signers: KeyProviderSync[]) => {
    const psbt = this.getSignedPSBTSync(psbtString, signers);
    return this.extractTx(psbt);
  };

  public signPSBTBase64 = async (
    psbtString: string,
    signers: KeyProvider[],
    shouldFinalize = true,
  ) => {
    const psbt = await this.getSignedPSBT(psbtString, signers);
    if (shouldFinalize && psbt.validateSignaturesOfAllInputs()) {
      psbt.finalizeAllInputs();
    }
    return {
      txId: BTC.getPsbtTxId(psbt),
      psbtB64: psbt.toBase64(),
    };
  };

  public signPSBTBase64Sync = (
    psbtString: string,
    signers: KeyProviderSync[],
    shouldFinalize = true,
  ) => {
    const psbt = this.getSignedPSBTSync(psbtString, signers);
    if (shouldFinalize && psbt.validateSignaturesOfAllInputs()) {
      psbt.finalizeAllInputs();
    }
    return {
      txId: BTC.getPsbtTxId(psbt),
      psbtB64: psbt.toBase64(),
    };
  };

  protected filterUniqueSigner = <T extends KeyProvider | KeyProviderSync>(
    signers: T[],
  ): T[] => {
    const singerMap: {[key: string]: T} = {};
    signers.forEach((each: T) => (singerMap[each.publicKey] = each));
    return Object.values(singerMap);
  };

  private getSignedPSBT = async (
    psbtString: string,
    signers: KeyProvider[],
  ) => {
    const psbt = bitcoin.Psbt.fromBase64(psbtString);
    await this.signAllInputsAsync(signers, psbt);
    return psbt;
  };

  private async signAllInputsAsync(signers: KeyProvider[], psbt: Psbt) {
    const uniqueSigners = this.filterUniqueSigner(signers);
    for (const signer of uniqueSigners) {
      const keyPair = {
        publicKey: Buffer.from(signer.publicKey, 'hex'),
        sign: async (hashBuffer: Buffer) => {
          const hexString = hashBuffer.toString('hex');
          const {r, s} = await signer.sign(hexString);
          return Buffer.concat([Buffer.from(r, 'hex'), Buffer.from(s, 'hex')]);
        },
      };
      await psbt.signAllInputsAsync(keyPair);
    }
  }

  private signAllInputsSync(signers: KeyProviderSync[], psbt: Psbt) {
    const uniqueSigners = this.filterUniqueSigner(signers);
    for (const signer of uniqueSigners) {
      const keyPair = {
        publicKey: Buffer.from(signer.publicKey, 'hex'),
        sign: (hashBuffer: Buffer) => {
          const hexString = hashBuffer.toString('hex');
          const {r, s} = signer.sign(hexString);
          return Buffer.concat([Buffer.from(r, 'hex'), Buffer.from(s, 'hex')]);
        },
      };
      psbt.signAllInputs(keyPair);
    }
  }

  private getSignedPSBTSync = (
    psbtString: string,
    signers: KeyProviderSync[],
  ) => {
    const psbt = bitcoin.Psbt.fromBase64(psbtString);
    this.signAllInputsSync(signers, psbt);
    return psbt;
  };

  private constructMessageHash = (message: string) => {
    const MAGIC_BYTES = Buffer.from(this.network.messagePrefix, 'utf-8');
    const messageBuffer = Buffer.from(message, 'utf-8');
    const messageLength = Buffer.from(numberToHex(messageBuffer.length), 'hex');
    const buffer = Buffer.concat([MAGIC_BYTES, messageLength, messageBuffer]);
    return hash256(buffer).toString('hex');
  };

  private async psbtSignMultiSignTx(
    txData: MultiSignTxData,
    signers: KeyProvider[],
  ) {
    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder
      .addMultiSignInputsForPsbt(txData)
      .addOutputForPsbt(txData)
      .getPsbt();
    await this.signAllInputsAsync(signers, psbt);
    return psbt;
  }

  private psbtSignMultiSignTxSync(
    txData: MultiSignTxData,
    signers: KeyProviderSync[],
  ) {
    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder
      .addMultiSignInputsForPsbt(txData)
      .addOutputForPsbt(txData)
      .getPsbt();

    this.signAllInputsSync(signers, psbt);
    return psbt;
  }

  private async psbtSignOmniMultiSignTx(
    txData: MultiSignOmniTxData,
    signers: KeyProvider[],
  ) {
    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder
      .addOmniMultiSignInputsForPsbt(txData)
      .addOmniOutputsForPsbt(txData)
      .getPsbt();
    await this.signAllInputsAsync(signers, psbt);
    return psbt;
  }

  private psbtSignOmniMultiSignTxSync(
    txData: MultiSignOmniTxData,
    signers: KeyProviderSync[],
  ) {
    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder
      .addOmniMultiSignInputsForPsbt(txData)
      .addOmniOutputsForPsbt(txData)
      .getPsbt();

    this.signAllInputsSync(signers, psbt);
    return psbt;
  }

  private extractTx = (psbt: bitcoin.Psbt) => {
    if (psbt.validateSignaturesOfAllInputs()) {
      psbt.finalizeAllInputs();

      const txHex = psbt.extractTransaction().toHex();
      const txId = psbt.extractTransaction().getId();
      return {
        txId,
        txHex,
      };
    }
    throw new Error('signature verification failed');
  };

  private extractMultiSignSignatures = (psbt: bitcoin.Psbt): string[] => {
    if (psbt.validateSignaturesOfAllInputs()) {
      return psbt.data.inputs.reduce((result: string[], input) => {
        const {partialSig = []} = input;
        const partialSigs = partialSig.map(item =>
          item.signature.toString('hex'),
        );
        return result.concat(partialSigs);
      }, []);
    }
    throw new Error('signature verification failed');
  };
}
