import { Coin, GenerateTransactionResult } from "../Common/coin";
import { SignProvider, SignProviderSync } from "../Common/sign";
export interface TxData {
    nonce: string;
    gasPrice: string;
    gasLimit: string;
    to: string;
    value: string;
    data: string;
    chainId: number;
}
export declare class ETH implements Coin {
    chainId: number;
    constructor(chainId?: number);
    generateTransactionSync: (data: TxData, signer: SignProviderSync) => GenerateTransactionResult;
    generateTransaction: (data: TxData, signer: SignProvider) => Promise<GenerateTransactionResult>;
    signMessageSync: (message: string, signer: SignProviderSync) => string;
    signMessage: (message: string, signer: SignProvider) => Promise<string>;
    generateAddress: (publicKey: string) => string;
    isAddressValid: (address: string, checkSum?: boolean | undefined) => boolean;
    private buildSignedTx;
    private extractSignedResult;
    private buildSignedMessage;
}
