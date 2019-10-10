import { SignProvider, SignProviderSync } from "../Common";
import { BaseTxData, Coin, GenerateTransactionResult } from "../Common/coin";
import { KeyProvider, KeyProviderSync } from "../Common/sign";
interface TxData extends BaseTxData {
    sequence: number;
    tag?: number;
}
export declare class XRP implements Coin {
    generateAddress: (publicKey: string) => any;
    isAddressValid: (address: string) => any;
    generateTransaction: (txData: TxData, keyProvider: KeyProvider, options?: any) => Promise<GenerateTransactionResult>;
    generateTransactionSync: (txData: any, keyProvider: KeyProviderSync, options?: any) => GenerateTransactionResult;
    signMessage: (message: string, signProvider: SignProvider) => Promise<string>;
    signMessageSync: (message: string, signProvider: SignProviderSync) => string;
    private generateUnsignedTx;
    private getSignedTx;
    private getSignMessageHex;
}
export {};
