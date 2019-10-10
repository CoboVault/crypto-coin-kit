import { Transaction } from "ethereumjs-tx";
import {
  addHexPrefix,
  hashPersonalMessage,
  isValidAddress,
  pubToAddress,
  toBuffer,
  toChecksumAddress
} from "ethereumjs-util";
import { Buffer } from "safe-buffer";

import { Coin, GenerateTransactionResult } from "../Common/coin";
import { Result, SignProvider, SignProviderSync } from "../Common/sign";
import numberToHex from "../utils/numberToHex";

export interface TxData {
  nonce: string;
  gasPrice: string;
  gasLimit: string;
  to: string;
  value: string;
  data: string;
  chainId: number;
}

export class ETH implements Coin {
  public chainId: number;
  constructor(chainId?: number) {
    this.chainId = chainId || 1;
  }

  public generateTransactionSync = (data: TxData, signer: SignProviderSync) => {
    const tx = new Transaction(data);
    const hash = tx.hash(false);
    const sig = signer.sign(hash.toString("hex"));
    const signedTx = this.buildSignedTx(tx, sig);
    return this.extractSignedResult(signedTx);
  };

  public generateTransaction = async (data: TxData, signer: SignProvider) => {
    const tx = new Transaction(data);
    const hash = tx.hash(false);
    const sig = await signer.sign(hash.toString("hex"));
    const signedTx = this.buildSignedTx(tx, sig);
    return this.extractSignedResult(signedTx);
  };

  public signMessageSync = (message: string, signer: SignProviderSync) => {
    const hash = hashPersonalMessage(Buffer.from(message, "utf8"));
    const sig = signer.sign(hash.toString("hex"));
    return this.buildSignedMessage(sig);
  };

  public signMessage = async (message: string, signer: SignProvider) => {
    const hash = hashPersonalMessage(Buffer.from(message, "utf8"));
    const sig = await signer.sign(hash.toString("hex"));
    return this.buildSignedMessage(sig);
  };

  public generateAddress = (publicKey: string) => {
    const address = pubToAddress(toBuffer(publicKey), true).toString("hex");
    return toChecksumAddress(address);
  };

  public isAddressValid = (address: string, checkSum?: boolean) => {
    if (checkSum) {
      return isValidAddress(address) && toChecksumAddress(address) === address;
    }
    return isValidAddress(address);
  };

  private buildSignedTx = (tx: Transaction, sigResult: Result): Transaction => {
    const r = Buffer.from(sigResult.r, "hex");
    const s = Buffer.from(sigResult.s, "hex");
    let v = 27 + sigResult.recId;
    if (this.chainId > 0) {
      v += this.chainId * 2 + 8;
    }

    const sig = { r, s, v: Buffer.alloc(1, v) };

    return Object.assign(tx, sig);
  };

  private extractSignedResult = (
    tx: Transaction
  ): GenerateTransactionResult => {
    return {
      txId: addHexPrefix(tx.hash().toString("hex")),
      txHex: addHexPrefix(tx.serialize().toString("hex"))
    };
  };

  private buildSignedMessage = (sigResult: Result): string => {
    const r = sigResult.r;
    const s = sigResult.s;
    const recIdStr = numberToHex(sigResult.recId);
    return addHexPrefix(r.concat(s).concat(recIdStr));
  };
}
