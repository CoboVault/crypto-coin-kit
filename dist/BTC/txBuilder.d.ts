import * as bitcoin from "bitcoinjs-lib";
import { TxData } from "./index";
export default class PsbtBuilder {
    private psbt;
    private network;
    constructor(network: bitcoin.Network);
    addInputsForPsbt: (txData: TxData) => this;
    addOutputForPsbt: (txData: TxData) => this;
    getPsbt: () => bitcoin.Psbt;
    private verifyInput;
    private isNonWitnessUtxo;
    private isDestinationOutputs;
}
