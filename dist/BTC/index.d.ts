import { UtxoCoin } from "../Common/coin";
import { KeyProvider, KeyProviderSync } from "../Common/sign";
declare enum AddressType {
    P2PKH = "P2PKH",
    P2SH = "P2SH",
    P2WPKH = "P2WPKH"
}
export declare enum NetWorkType {
    mainNet = "mainNet",
    testNet = "testNet"
}
export interface TxOutputItem {
    address: "string";
    value: number;
}
export interface WitnessUtxo {
    publicKey: string;
    script: string;
    value: number;
}
export interface NonWitnessUtxo {
    nonWitnessUtxo: string;
    value: number;
}
export interface TxInputItem {
    hash: string;
    index: number;
    utxo: WitnessUtxo | NonWitnessUtxo;
}
export interface Destination {
    to: string;
    amount: number;
    fee: number;
    changeAddres: string;
}
export interface TxData {
    inputs: TxInputItem[];
    outputs: TxOutputItem[] | Destination;
}
export default class BTC implements UtxoCoin {
    private network;
    constructor(networkType?: NetWorkType);
    generateAddress: (publicKey: string, addressType?: AddressType) => string;
    isAddressValid: (address: string) => boolean;
    generateTransaction: (txData: TxData, signers: KeyProvider[]) => Promise<{
        txId: string;
        txHex: string;
    }>;
    generateTransactionSync: (txData: TxData, signers: KeyProviderSync[]) => {
        txId: string;
        txHex: string;
    };
    signMessage: (message: string, signer: KeyProvider) => Promise<string>;
    signMessageSync: (message: string, singerSync: KeyProviderSync) => string;
    generatePsbt: (txData: TxData) => string;
    parsePsbt: (psbtString: string) => {
        inputs: {
            txId: string;
            index: number;
        }[];
        outputs: {
            address: string;
            value: number;
        }[];
    };
    signPsbt: (psbtString: string, signers: KeyProvider[]) => Promise<{
        txId: string;
        txHex: string;
    }>;
    signPsbtSync: (psbtString: string, signers: KeyProviderSync[]) => {
        txId: string;
        txHex: string;
    };
    private constructMessageHash;
    private extractTx;
}
export {};
