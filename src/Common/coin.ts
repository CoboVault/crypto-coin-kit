import Common, {SignProviderDeprecated} from '../Common';
import {KeyProvider, KeyProviderSync} from './sign';

export interface Result {
  r: string;
  s: string;
}

export default class CoinDeprecated {
  public sign(rawTx: string, signProvider: SignProviderDeprecated) {
    return Common.sign(rawTx, signProvider);
  }
}

export interface BaseTxData {
  to: string;
  amount: number;
  changeAddress: string;
  fee: number;
}

export interface GenerateTransactionResult {
  txId: string;
  txHex: string;
}

export interface Coin extends BaseCoin {
  generateTransaction: (
    txData: any,
    keyProvider: KeyProvider,
    options?: any,
  ) => Promise<GenerateTransactionResult>;
  generateTransactionSync: (
    txData: any,
    keyProvider: KeyProviderSync,
    options?: any,
  ) => GenerateTransactionResult;
  signMessage: (message: string, signProvider: KeyProvider) => Promise<string>;
  signMessageSync: (message: string, signProvider: KeyProviderSync) => string;
}

export interface UtxoCoin extends BaseCoin {
  generateTransaction: (
    txData: any,
    keyProviders: KeyProvider[],
    options?: any,
  ) => Promise<GenerateTransactionResult>;
  generateTransactionSync: (
    txData: any,
    keyProviders: KeyProviderSync[],
    options?: any,
  ) => GenerateTransactionResult;
  signMessage: (message: string, keyProvider: KeyProvider) => Promise<string>;
  signMessageSync: (message: string, KeyProvider: KeyProviderSync) => string;
}

interface BaseCoin {
  generateAddress: (publicKey: string, options?: any) => string;
  isAddressValid: (address: string) => boolean;
}
