import { SignProvider, SignProviderSync } from "../Common";
import { Coin } from "../Common/coin";
export interface Input {
    address: string;
    txId: string;
    outputIndex: number;
    satoshis: number;
}
export interface AdaptedInput {
    address: string;
    txId: string;
    outputIndex: number;
    satoshis: number;
    script: string;
}
interface TxData {
    inputs: Input[];
    changeAddress: string;
    amount: number;
    to: string;
    fee: number;
}
export declare class XZC implements Coin {
    protected network: string;
    constructor(network?: string);
    generateAddress: (publicKey: string) => any;
    isAddressValid: (address: string) => any;
    generateTransaction: (txData: TxData, signer: SignProvider, options: {
        signerPubkey: string;
    }) => Promise<{
        txId: string;
        txHex: string;
    }>;
    generateTransactionSync: (txData: TxData, signer: SignProviderSync, options: {
        signerPubkey: string;
    }) => {
        txId: string;
        txHex: string;
    };
    /**
     * @returns the return value is the (r,s,recId) of the signature
     */
    signMessage: (message: string, signer: SignProvider) => Promise<string>;
    /**
     * @returns the return value is the (r,s,recId) of the signature
     */
    signMessageSync: (message: string, signer: SignProviderSync) => string;
    private getSignMessageHex;
}
export {};
