import {BigNumber} from 'bignumber.js';
import {Transaction} from 'ethereumjs-tx';
import {
  addHexPrefix,
  hashPersonalMessage,
  isValidAddress,
  pubToAddress,
  toBuffer,
  toChecksumAddress,
} from 'ethereumjs-util';
// @ts-ignore
import abi from 'human-standard-token-abi';
import {Buffer} from 'safe-buffer';
// @ts-ignore
import Web3 from 'web3';

import {Coin, GenerateTransactionResult} from '../Common/coin';
import {Result, SignProvider, SignProviderSync} from '../Common/sign';
import numberToHex from '../utils/numberToHex';

export interface TxData {
  nonce: number;
  gasPrice: string;
  gasLimit: string;
  to: string;
  value: string;
  memo?: string;
  contractAddress?: string; // optional,required for erc20 token
}

export interface RawTxData {
  gasLimit: string;
  gasPrice: string;
  to: string;
  nonce: string;
  data: string;
  v?: string;
  r?: string;
  s?: string;
  value: string;
}

const MAINNET_CHAIN_ID = 1;
export class ETH implements Coin {
  public chainId: number;

  constructor(chainId?: number) {
    this.chainId = chainId || MAINNET_CHAIN_ID;
  }

  public generateTransactionSync = (
    data: TxData | RawTxData,
    signer: SignProviderSync,
  ) => {
    const tx = this.constructTransaction(data);
    const hash = tx.hash(false);
    const sig = signer.sign(hash.toString('hex'));
    const signedTx = this.buildSignedTx(tx, sig);
    return this.extractSignedResult(signedTx);
  };

  public generateTransaction = async (
    data: TxData | RawTxData,
    signer: SignProvider,
  ) => {
    const tx = this.constructTransaction(data);
    const hash = tx.hash(false);
    const sig = await signer.sign(hash.toString('hex'));
    const signedTx = this.buildSignedTx(tx, sig);
    return this.extractSignedResult(signedTx);
  };

  public signMessageSync = (message: string, signer: SignProviderSync) => {
    const hash = hashPersonalMessage(Buffer.from(message, 'utf8'));
    const sig = signer.sign(hash.toString('hex'));
    return this.buildSignedMessage(sig);
  };

  public signMessage = async (message: string, signer: SignProvider) => {
    const hash = hashPersonalMessage(Buffer.from(message, 'utf8'));
    const sig = await signer.sign(hash.toString('hex'));
    return this.buildSignedMessage(sig);
  };

  public generateAddress = (publicKey: string) => {
    const address = pubToAddress(toBuffer(publicKey), true).toString('hex');
    return toChecksumAddress(address);
  };

  public isAddressValid = (address: string, checkSum?: boolean) => {
    if (checkSum) {
      return isValidAddress(address) && toChecksumAddress(address) === address;
    }
    return isValidAddress(address);
  };

  public generateTokenTransferData = (
    to: string,
    value: string,
    contractAddress: string,
  ) => {
    const token = new Web3().eth.contract(abi).at(contractAddress);
    return token.transfer.getData(to, this.toHexString(value));
  };

  public decodeTokenTransferData = (data: string) => {
    const dataBuf = Buffer.from(data, 'hex');
    if (dataBuf.length === 68) {
      const transferTo = '0x' + dataBuf.slice(-52, -32).toString('hex');
      const tokenAmount = new BigNumber(
        dataBuf.slice(-32).toString('hex'),
        16,
      ).toString(10);
      return {
        transferTo,
        tokenAmount,
      };
    }
  };

  protected constructTransaction = (data: TxData | RawTxData) => {
    if ('data' in data) {
      return new Transaction(data, {chain: this.chainId});
    } else {
      console.log(this.formatTxData(data))
      return new Transaction(this.formatTxData(data), {chain: this.chainId});
    }
  };

  protected formatTxData = (tx: TxData) => {
    let memo = '0x';
    if (tx.memo) {
      memo = addHexPrefix(Buffer.from(tx.memo, 'utf-8').toString('hex'));
    }
    let inputData = memo;
    let toAddress = tx.to;
    let transferValue = this.toHexString(tx.value);
    if (tx.contractAddress) {
      inputData = this.generateTokenTransferData(
        tx.to,
        tx.value,
        tx.contractAddress,
      );
      toAddress = tx.contractAddress;
      transferValue = '0x';
    }

    return {
      nonce: addHexPrefix(numberToHex(tx.nonce || 0)),
      gasPrice: this.toHexString(tx.gasPrice),
      gasLimit: this.toHexString(tx.gasLimit),
      chainId: this.chainId,
      to: toAddress,
      value: transferValue,
      data: inputData,
    };
  };

  private buildSignedTx = (tx: Transaction, sigResult: Result): Transaction => {
    const r = Buffer.from(sigResult.r, 'hex');
    const s = Buffer.from(sigResult.s, 'hex');
    let v = 27 + sigResult.recId;
    if (this.chainId > 0) {
      v += this.chainId * 2 + 8;
    }

    const sig = {r, s, v: Buffer.alloc(1, v)};

    return Object.assign(tx, sig);
  };

  private extractSignedResult = (
    tx: Transaction,
  ): GenerateTransactionResult => {
    return {
      txId: addHexPrefix(tx.hash().toString('hex')),
      txHex: addHexPrefix(tx.serialize().toString('hex')),
    };
  };

  private buildSignedMessage = (sigResult: Result): string => {
    const r = sigResult.r;
    const s = sigResult.s;
    const recIdStr = numberToHex(sigResult.recId);
    return addHexPrefix(r.concat(s).concat(recIdStr));
  };

  private toHexString = (str: string) => {
    return addHexPrefix(new BigNumber(str, 10).toString(16));
  };
}
