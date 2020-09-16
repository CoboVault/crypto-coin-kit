import {Coin, GenerateTransactionResult} from '../Common/coin';
// @ts-ignore
import {sha3, publicKeyToAddress} from 'js-conflux-sdk/src/util/sign';
const format = require('js-conflux-sdk/src/util/format');
const Transaction = require('js-conflux-sdk/src/Transaction');
const Message = require('js-conflux-sdk/src/Message');

import {Result, SignProviderSync, SignProvider} from '../Common/sign';

export interface TxData {
  nonce: string | number;
  gasPrice: string | number;
  gas: string | number;
  to?: string;
  value?: string | number;
  storageLimit: string | number;
  epochHeight: string | number;
  chainId?: string | number;
}

export class CFX implements Coin {
  public chainId: number;

  constructor(chainId?: number) {
    this.chainId = chainId || 0x01;
  }

  public generateAddress = (publicKey: string) => {
    const address = publicKeyToAddress(format.buffer(publicKey));
    return format.address(address);
  };

  public isAddressValid = (address: string) => {
    return true;
  };

  public generateTransactionSync = (data: TxData, signer: SignProviderSync) => {
    const tx = new Transaction(data);
    const hash = sha3(tx.encode(false));
    const sig = signer.sign(format.hex(hash));
    tx.r = sig.r;
    tx.s = sig.s;
    tx.v = sig.recId;
    return {
      txId: tx.hash,
      txHex: tx.serialize(),
    };
  };

  public generateTransaction = async (data: TxData, signer: SignProvider) => {
    const tx = new Transaction(data);
    const hash = sha3(tx.encode(false));
    const sig = await signer.sign(format.hex(hash));
    tx.r = sig.r;
    tx.s = sig.s;
    tx.v = sig.recId;
    return {
      txId: tx.hash,
      txHex: tx.serialize(),
    };
  };

  public signMessageSync = (message: string, signer: SignProviderSync) => {
    const hash = sha3(Buffer.from(message));
    const sig = signer.sign(format.hex(hash));
    return this.buildSignedMessage(sig);
  };

  public signMessage = async (message: string, signer: SignProvider) => {
    const hash = sha3(Buffer.from(message));
    const sig = await signer.sign(format.hex(hash));
    return this.buildSignedMessage(sig);
  };

  private buildSignedMessage = (sigResult: Result): string => {
    const buffer = Buffer.concat([
      format.buffer(sigResult.r),
      format.buffer(sigResult.s),
      format.buffer(sigResult.recId),
    ]);
    return format.signature(buffer);
  };
}
