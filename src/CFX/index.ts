import {
  sha3,
  publicKeyToAddress,
  checksumAddress,
  // @ts-ignore
} from 'js-conflux-sdk/src/util/sign';
// @ts-ignore
import format from 'js-conflux-sdk/src/util/format';
// @ts-ignore
import Transaction from 'js-conflux-sdk/src/Transaction';
// @ts-ignore
import Contract from 'js-conflux-sdk/src/Contract';

import {Result, SignProviderSync, SignProvider} from '../Common/sign';
import {Coin} from '../Common/coin';
// @ts-ignore
import abi from 'human-standard-token-abi';

export interface TxData {
  nonce: string | number;
  gasPrice: string;
  gas: string;
  to: string;
  value: string;
  storageLimit: string | number;
  epochHeight: string | number;
  chainId?: string | number;
  contractAddress?: string; // optional for conflux token
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
    const hex = format.buffer(address);
    const expect_addr = format.address(hex);
    const expect_chsum_addr = checksumAddress(expect_addr);
    const right_format =
      address === expect_addr || address === expect_chsum_addr;

    const right_header = 0x10 === (hex[0] & 0xf0);
    return right_format && right_header;
  };

  public generateTransactionSync = (data: TxData, signer: SignProviderSync) => {
    const tx = this.constructTransaction(data);
    const hash = sha3(tx.encode(false));
    const sig = signer.sign(format.hex(hash));
    Object.assign(tx, {r: sig.r, s: sig.s, v: sig.recId});
    return {
      txId: tx.hash,
      txHex: tx.serialize(),
    };
  };

  public generateTransaction = async (data: TxData, signer: SignProvider) => {
    const tx = this.constructTransaction(data);
    const hash = sha3(tx.encode(false));
    const sig = await signer.sign(format.hex(hash));
    Object.assign(tx, {r: sig.r, s: sig.s, v: sig.recId});
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

  protected constructTransaction = (data: TxData) => {
    return new Transaction(this.formatTxData(data));
  };

  protected formatTxData = (tx: TxData) => {
    let inputData = '0x';
    let toAddress = tx.to;
    let transferValue = tx.value;
    if (tx.contractAddress) {
      inputData = this.generateTokenTransferData(
        tx.to,
        tx.value,
        tx.contractAddress,
      );
      toAddress = tx.contractAddress;
      transferValue = '0';
    }

    return {
      nonce: tx.nonce,
      gasPrice: tx.gasPrice,
      gas: tx.gas,
      to: toAddress,
      value: transferValue,
      storageLimit: tx.storageLimit,
      epochHeight: tx.epochHeight,
      chainId: tx.chainId,
      data: inputData,
    };
  };

  public generateTokenTransferData = (
    to: string,
    value: string,
    contractAddress: string,
  ) => {
    const contract = new Contract({abi, address: contractAddress});
    return contract.transfer(to, value).data;
  };
}
