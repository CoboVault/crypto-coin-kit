import { SignProvider, SignProviderSync } from "../Common";
import { Coin } from "../Common/coin";
export interface Input {
    address: string;
    txId: string;
    outputIndex: number;
    atoms: number;
}
export interface AdaptedInput {
    address: string;
    txId: string;
    outputIndex: number;
    atoms: number;
    script: string;
}
interface TxData {
    inputs: Input[];
    changeAddress: string;
    amount: number;
    to: string;
    fee: number;
}
interface Options {
    signerPubkey: string;
    disableLargeFees?: boolean;
}
export declare class DCR implements Coin {
    protected network: string;
    constructor(network?: string);
    generateAddress: (publicKey: string) => any;
    isAddressValid: (address: string) => any;
    generateTransaction: (txData: TxData, signer: SignProvider, { disableLargeFees, ...options }: Options) => Promise<{
        txId: string;
        txHex: string;
    }>;
    generateTransactionSync: (txData: TxData, signer: SignProviderSync, { disableLargeFees, ...options }: Options) => {
        txId: string;
        txHex: string;
    };
    /**
     * @returns the return value is the (r,s) of the signature
     */
    signMessage: (message: string, signer: SignProvider) => Promise<string>;
    /**
     * @returns the return value is the (r,s) of the signature
     */
    signMessageSync: (message: string, signer: SignProviderSync) => string;
    private getSignMessageHex;
}
export {};
