import {decode as bech32Decode} from "bech32"
import * as bitcoin from "bitcoinjs-lib";
// @ts-ignore
import bs58check from "bs58check";
import { Buffer as SafeBuffer } from "safe-buffer";
import { UtxoCoin } from "../Common/coin";
import { KeyProvider, KeyProviderSync } from "../Common/sign";
import { hash256, numberToHex } from "../utils";
import PsbtBuilder from "./txBuilder";

export enum AddressType {
  P2PKH = "P2PKH",
  P2SH = "P2SH",
  P2WPKH = "P2WPKH"
}

export enum NetWorkType {
  mainNet = "mainNet",
  testNet = "testNet"
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

export interface OmniTxData {
  inputs: TxInputItem[];
  to: string;
  fee: number;
  changeAddress:string;
  omniAmount: number; // sat unit
  propertyId?: number;
}

export class BTC implements UtxoCoin {
  protected network: bitcoin.Network;
  constructor(networkType: NetWorkType = NetWorkType.mainNet) {
    if (networkType === NetWorkType.mainNet) {
      this.network = bitcoin.networks.bitcoin;
    } else {
      this.network = bitcoin.networks.regtest;
    }
  }

  public generateAddress (
    publicKey: string,
    addressType: AddressType = AddressType.P2SH
  ) {
    let btcAddress: string | undefined;
    const pubkeyBuffer = (SafeBuffer.from(
      publicKey,
      "hex"
    ) as unknown) as Buffer;
    if (addressType === AddressType.P2PKH) {
      const { address } = bitcoin.payments.p2pkh({
        pubkey: pubkeyBuffer,
        network: this.network
      });
      btcAddress = address;
    }
    if (addressType === AddressType.P2SH) {
      const { address } = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
          pubkey: pubkeyBuffer,
          network: this.network
        }),
        network: this.network
      });
      btcAddress = address;
    }
    if (addressType === AddressType.P2WPKH) {
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: pubkeyBuffer,
        network: this.network
      });
      btcAddress = address;
    }

    if (btcAddress) {
      return btcAddress;
    } else {
      throw new Error("generate address failed");
    }
  };


  public generateMultiSignAddress (
    publicKeys: string[],
    requires: number,
  ) {
    const pubkeysBuffer = publicKeys.map(pubkey => {
      return (SafeBuffer.from(
        pubkey,
        "hex"
      ) as unknown) as Buffer;
    })

    const p2ms = bitcoin.payments.p2ms({ m: requires, pubkeys: pubkeysBuffer, network: this.network });
    const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network: this.network });
    const p2sh = bitcoin.payments.p2sh({ redeem: p2wsh, network: this.network });
  
    const btcAddress = p2sh.address;
    if (btcAddress) {
      return btcAddress;
    } else {
      throw new Error("generate address failed");
    }
  };

  public isAddressValid (address: string){
    if (
      address.startsWith("1") ||
      address.startsWith("3") ||
      address.startsWith("2")
    ) {
      try {
        bs58check.decode(address);
        return true;
      } catch (e) {
        return false;
      }
    } else if(address.startsWith("bc")) {
      try {
        bech32Decode(address);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  };

  public async generateTransaction  (
    txData: TxData,
    signers: KeyProvider[]
  ){
    const uniqueSigners = this.filterUniqueSigner(signers)
    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder
      .addInputsForPsbt(txData)
      .addOutputForPsbt(txData)
      .getPsbt();

    if (txData.locktime) {
      psbt.setLocktime(txData.locktime);
    }

    if (txData.version) {
      psbt.setVersion(txData.version);
    }

    for (const signer of uniqueSigners) {
      const keyPair = {
        publicKey: Buffer.from(signer.publicKey, "hex"),
        sign: async (hashBuffer: Buffer) => {
          const hexString = hashBuffer.toString("hex");
          const { r, s } = await signer.sign(hexString);
          return Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")]);
        }
      };
      await psbt.signAllInputsAsync(keyPair);
    }

    return this.extractTx(psbt);
  };

  public generateOmniTransaction = async (
      omniTxData: OmniTxData,
      signers: KeyProvider[]) => {
      const uniqueSigners =  this.filterUniqueSigner(signers)
      const psbtBuilder = new PsbtBuilder(this.network);
      const psbt = psbtBuilder.buildOmniPsbt(omniTxData).getPsbt();
      for (const signer of uniqueSigners) {
          const keyPair = {
              publicKey: Buffer.from(signer.publicKey, "hex"),
              sign: async (hashBuffer: Buffer) => {
                  const hexString = hashBuffer.toString("hex");
                  const { r, s } = await signer.sign(hexString);
                  return Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")]);
              }
          };
          await psbt.signAllInputsAsync(keyPair);
      }
      return this.extractTx(psbt);
  };

  public generateTransactionSync (
    txData: TxData,
    signers: KeyProviderSync[]
  ){
    const uniqueSigners =  this.filterUniqueSigner(signers)
    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder
      .addInputsForPsbt(txData)
      .addOutputForPsbt(txData)
      .getPsbt();
    if (txData.locktime) {
      psbt.setLocktime(txData.locktime);
    }

    if (txData.version) {
      psbt.setVersion(txData.version);
    }
    for (const signer of uniqueSigners) {
      const keyPair = {
        publicKey: Buffer.from(signer.publicKey, "hex"),
        sign: (hashBuffer: Buffer) => {
          const hexString = hashBuffer.toString("hex");
          const { r, s } = signer.sign(hexString);
          return Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")]);
        }
      };
      psbt.signAllInputs(keyPair);
    }

    return this.extractTx(psbt);
  };

  public generateOmniTransactionSync = (
      omniTxData: OmniTxData,
      signers: KeyProviderSync[]) => {
      const uniqueSigners =  this.filterUniqueSigner(signers)  
      const psbtBuilder = new PsbtBuilder(this.network);
      const psbt = psbtBuilder.buildOmniPsbt(omniTxData).getPsbt();
      for (const signer of uniqueSigners) {
          const keyPair = {
              publicKey: Buffer.from(signer.publicKey, "hex"),
              sign: (hashBuffer: Buffer) => {
                  const hexString = hashBuffer.toString("hex");
                  const { r, s } = signer.sign(hexString);
                  return Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")]);
              }
          };
          psbt.signAllInputs(keyPair);
      }
      return this.extractTx(psbt);
  };

  public async generateMultiSignTransaction  (
    txData: MultiSignTxData,
    signers: KeyProvider[]
  ){
    const psbt = await this.psbtSignMultiSignTx(txData, signers);
    return this.extractTx(psbt);
  };

  public generateMultiSignTransactionSync  (
    txData: MultiSignTxData,
    signers: KeyProviderSync[]
  ){
    const psbt = this.psbtSignMultiSignTxSync(txData, signers);
    return this.extractTx(psbt);
  };

  public async getMultiSignTransactionSignature  (
    txData: MultiSignTxData,
    signers: KeyProvider[]
  ){
    const psbt = await this.psbtSignMultiSignTx(txData, signers);
    return this.extractMultiSignSignatures(psbt);
  };

  public getMultiSignTransactionSignatureSync  (
    txData: MultiSignTxData,
    signers: KeyProviderSync[]
  ){
    const psbt = this.psbtSignMultiSignTxSync(txData, signers);
    return this.extractMultiSignSignatures(psbt);
  };

  public signMessage = async (message: string, signer: KeyProvider) => {
    const hashHex = this.constructMessageHash(message);
    const { r, s } = await signer.sign(hashHex);
    return `${r}${s}`;
  };

  public signMessageSync = (message: string, signerSync: KeyProviderSync) => {
    const hashHex = this.constructMessageHash(message);
    const { r, s } = signerSync.sign(hashHex);
    return `${r}${s}`;
  };

  public generatePsbt = (txData: TxData): string => {
    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder
      .addInputsForPsbt(txData)
      .addOutputForPsbt(txData)
      .getPsbt();
    return psbt.toBase64();
  };

  public parsePsbt = (psbtString: string) => {
    const psbt = bitcoin.Psbt.fromBase64(psbtString);
    const txBuffer = psbt.data.getTransaction();
    const tx = bitcoin.Transaction.fromBuffer(txBuffer);
    const inputs = tx.ins.map(each => ({
      txId: each.hash.reverse().toString("hex"),
      index: each.index
    }));
    const outputs = tx.outs.map(each => {
      const address = bitcoin.address.fromOutputScript(
        each.script,
        this.network
      );
      const eachOutput = each as bitcoin.TxOutput;
      const value = eachOutput.value;
      return {
        address,
        value
      };
    });
    return {
      inputs,
      outputs
    };
  };

  public signPsbt = async (psbtString: string, signers: KeyProvider[]) => {
    const psbt = bitcoin.Psbt.fromBase64(psbtString);
    for (const signer of signers) {
      const keyPair = {
        publicKey: Buffer.from(signer.publicKey, "hex"),
        sign: async (hashBuffer: Buffer) => {
          const hexString = hashBuffer.toString("hex");
          const { r, s } = await signer.sign(hexString);
          return Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")]);
        }
      };
      await psbt.signAllInputsAsync(keyPair);
    }
    return this.extractTx(psbt);
  };

  public signPsbtSync = (psbtString: string, signers: KeyProviderSync[]) => {
    const psbt = bitcoin.Psbt.fromBase64(psbtString);
    for (const signer of signers) {
      const keyPair = {
        publicKey: Buffer.from(signer.publicKey, "hex"),
        sign: (hashBuffer: Buffer) => {
          const hexString = hashBuffer.toString("hex");
          const { r, s } = signer.sign(hexString);
          return Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")]);
        }
      };
      psbt.signAllInputs(keyPair);
    }
    return this.extractTx(psbt);
  };

  protected filterUniqueSigner = <T extends KeyProvider | KeyProviderSync>(signers:T[]) : T[] => {
    const singerMap:{[key:string]: T} = {}
    signers.forEach((each: T) => singerMap[each.publicKey] = each)
    return Object.values(singerMap)  
  } 

  private constructMessageHash = (message: string) => {
    const MAGIC_BYTES = Buffer.from(this.network.messagePrefix, "utf-8");
    const messageBuffer = Buffer.from(message, "utf-8");
    const messageLength = Buffer.from(numberToHex(messageBuffer.length), "hex");
    const buffer = Buffer.concat([MAGIC_BYTES, messageLength, messageBuffer]);
    const hashHex = hash256(buffer).toString("hex");
    return hashHex;
  };

  private async psbtSignMultiSignTx  (
    txData: MultiSignTxData,
    signers: KeyProvider[]
  ){
    const uniqueSigners = this.filterUniqueSigner(signers)

    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder.addMultiSignInputsForPsbt(txData).addOutputForPsbt(txData).getPsbt();

    for (const signer of uniqueSigners) {
      const keyPair = {
        publicKey: Buffer.from(signer.publicKey, "hex"),
        sign: async (hashBuffer: Buffer) => {
          const hexString = hashBuffer.toString("hex");
          const { r, s } = await signer.sign(hexString);
          return Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")]);
        }
      };
      await psbt.signAllInputsAsync(keyPair)
    }

    return psbt;
  };

  private psbtSignMultiSignTxSync  (
    txData: MultiSignTxData,
    signers: KeyProviderSync[]
  ){
    const uniqueSigners = this.filterUniqueSigner(signers)

    const psbtBuilder = new PsbtBuilder(this.network);
    const psbt = psbtBuilder.addMultiSignInputsForPsbt(txData).addOutputForPsbt(txData).getPsbt();

    for (const signer of uniqueSigners) {
      const keyPair = {
        publicKey: Buffer.from(signer.publicKey, "hex"),
        sign: (hashBuffer: Buffer) => {
          const hexString = hashBuffer.toString("hex");
          const { r, s } = signer.sign(hexString);
          return Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")]);
        }
      };
      psbt.signAllInputsAsync(keyPair)
    }

    return psbt;
  };

  private extractTx = (psbt: bitcoin.Psbt) => {
    if (psbt.validateSignaturesOfAllInputs()) {
      psbt.finalizeAllInputs();

      const txHex = psbt.extractTransaction().toHex();
      const txId = psbt.extractTransaction().getId();
      return {
        txId,
        txHex
      };
    }
    throw new Error("signature verification failed");
  };

  private extractMultiSignSignatures = (psbt: bitcoin.Psbt): string[] => {
    if (psbt.validateSignaturesOfAllInputs()) {
      const signatures = psbt.data.inputs.reduce((result: string[], input) => {
        const {partialSig = []} = input;
        const partialSigs = partialSig.map(item => item.signature.toString('hex'));
        return result.concat(partialSigs);
      }, [])
      return signatures;
    }
    throw new Error("signature verification failed");
  }
}
