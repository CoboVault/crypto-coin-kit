import { SignProvider } from "../Common";
import Coin from "../Common/coin";
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
export declare class DCR extends Coin {
    protected network: string;
    constructor();
    generateAddress: (publicKey: string) => any;
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
