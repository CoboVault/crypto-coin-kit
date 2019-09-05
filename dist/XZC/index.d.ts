import { SignProvider } from "../Common";
import Coin from "../Common/coin";
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
export declare class XZC extends Coin {
    generateAddress: (publicKey: string, network?: string) => any;
    isAddressValid: (address: string) => any;
    generateTransaction: (txData: TxData, signProvider: SignProvider, options: {
        publicKey: string;
    }) => Promise<{
        txId: string;
        txHex: string;
    }>;
    signMessage: (message: string, signProvider: SignProvider) => Promise<string>;
}
export {};
