// @ts-ignore
import {Transaction, Conflux, util} from './lib';
// @ts-ignore
import sha3 from 'js-sha3';
import {Result, SignProviderSync, SignProvider} from '../Common/sign';
import {Coin} from '../Common/coin';
// @ts-ignore
import abi from 'human-standard-token-abi';

const {publicKeyToAddress, checksumAddress} = util.sign;
const {format} = util;

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

export class TCFX implements Coin {
  public chainId: number;

  constructor(chainId?: number) {
    this.chainId = chainId || 1;
  }

  public generateAddress = (publicKey: string) => {
    const address = publicKeyToAddress(format.buffer(publicKey));
    return '0x'+Buffer.from(address).toString('hex');
  };

  public convertAddress = (address: string, networkId = 1029) => {
    return format.address(address, networkId);
  }

  public isAddressValid = (address: string) => {
    try {
      this.convertAddress(address);
      return true;
    } catch (e) {
      return false;
    }
  };

  public generateTransactionSync = (data: TxData, signer: SignProviderSync) => {
    const tx = this.constructTransaction(data);
    const hash = sha3.keccak_256(tx.encode(false));
    const sig = signer.sign(hash);
    Object.assign(tx, {
      r: format.hex(`0x${sig.r}`),
      s: format.hex(`0x${sig.s}`),
      v: sig.recId,
    });
    return {
      txId: tx.hash,
      txHex: tx.serialize(),
    };
  };

  public generateTransaction = async (data: TxData, signer: SignProvider) => {
    const tx = this.constructTransaction(data);
    const hash = sha3.keccak_256(tx.encode(false));
    const sig = await signer.sign(hash);
    Object.assign(tx, {
      r: format.hex(`0x${sig.r}`),
      s: format.hex(`0x${sig.s}`),
      v: sig.recId,
    });
    return {
      txId: tx.hash,
      txHex: tx.serialize(),
    };
  };

  public signMessageSync = (message: string, signer: SignProviderSync) => {
    const hash = sha3.keccak_256(Buffer.from(message));
    const sig = signer.sign(hash);
    return this.buildSignedMessage(sig);
  };

  public signMessage = async (message: string, signer: SignProvider) => {
    const hash = sha3.keccak_256(Buffer.from(message));
    const sig = await signer.sign(hash);
    return this.buildSignedMessage(sig);
  };

  private buildSignedMessage = (sigResult: Result): string => {
    const rev_buffer = Buffer.alloc(1);
    rev_buffer.writeUInt8(sigResult.recId, 0);
    const buffer = Buffer.concat([
      Buffer.from(sigResult.r, 'hex'),
      Buffer.from(sigResult.s, 'hex'),
      rev_buffer,
    ]);
    return format.signature(buffer);
  };

  protected constructTransaction = (data: TxData) => {
    // @ts-ignore
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
    const contract = new Conflux().Contract({abi, address: contractAddress});
    //@ts-ignore
    return contract.transfer(to, value).data;
  };
}
