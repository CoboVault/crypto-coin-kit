import { SignProviderDeprecated } from "../Common";
import CoinDeprecated from "../Common/coin";
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
export declare class XZC extends CoinDeprecated {
    protected network: string;
    constructor();
    generateAddress: (publicKey: string) => any;
    isAddressValid: (address: string) => any;
    generateTransaction: (txData: TxData, signProvider: SignProviderDeprecated, options: {
        publicKey: string;
    }) => Promise<{
        txId: string;
        txHex: string;
    }>;
    signMessage: (message: string, signProvider: SignProviderDeprecated) => Promise<any>;
}
export {};
