import * as bitcoin from "bitcoinjs-lib";
import {
  Destination,
  NonWitnessUtxo,
  TxData,
  TxInputItem,
  TxOutputItem,
  WitnessUtxo
} from "./index";

const MAX_FEE = 1000000;

export default class PsbtBuilder {
  private psbt: bitcoin.Psbt;
  private network: bitcoin.Network;
  constructor(network: bitcoin.Network) {
    this.network = network;
    this.psbt = new bitcoin.Psbt({ network });
  }

  public addInputsForPsbt = (txData: TxData) => {
    if (this.verifyInput(txData)) {
      txData.inputs.forEach(eachInput => {
        if (this.isNonWitnessUtxo(eachInput.utxo)) {
          return this.psbt.addInput({
            hash: eachInput.hash,
            index: eachInput.index,
            nonWitnessUtxo: Buffer.from(eachInput.utxo.nonWitnessUtxo, "hex")
          });
        } else {
          return this.psbt.addInput({
            hash: eachInput.hash,
            index: eachInput.index,
            witnessUtxo: {
              script: Buffer.from(eachInput.utxo.script, "hex"),
              value: eachInput.utxo.value
            },
            redeemScript: bitcoin.payments.p2wpkh({
              pubkey: Buffer.from(eachInput.utxo.publicKey, "hex"),
              network: this.network
            }).output
          });
        }
      });
      return this;
    }
    throw new Error("input value are invaild");
  };

  public addOutputForPsbt = (txData: TxData) => {
    if (this.isDestinationOutputs(txData.outputs)) {
      this.psbt.addOutput({
        address: txData.outputs.to,
        value: txData.outputs.amount
      });
      const totalInputs = txData.inputs.reduce(
        (acc: number, cur: TxInputItem) => acc + cur.utxo.value,
        0
      );
      const changeAmount =
        totalInputs - txData.outputs.amount - txData.outputs.fee;
      this.psbt.addOutput({
        address: txData.outputs.changeAddress,
        value: changeAmount
      });
    } else {
      this.psbt.addOutputs(txData.outputs);
    }
    return this;
  };

  public getPsbt = () => {
    return this.psbt;
  };

  private verifyInput = (txData: TxData, disableLargeFee: boolean = true) => {
    const totalInputs = txData.inputs.reduce(
      (acc: number, cur: TxInputItem) => acc + cur.utxo.value,
      0
    );
    if (this.isDestinationOutputs(txData.outputs)) {
      if (totalInputs >= txData.outputs.fee + txData.outputs.amount) {
        return true;
      }
    } else {
      const totalOuputs = txData.outputs.reduce(
        (acc: number, cur: TxOutputItem) => acc + cur.value,
        0
      );
      const fee = totalInputs - totalOuputs;
      if (fee >= 0 && (disableLargeFee ? fee < MAX_FEE : true)) {
        return true;
      }
    }
    return false;
  };

  private isNonWitnessUtxo = (
    utxo: WitnessUtxo | NonWitnessUtxo
  ): utxo is NonWitnessUtxo => {
    return (utxo as NonWitnessUtxo).nonWitnessUtxo !== undefined;
  };

  private isDestinationOutputs = (
    out: TxOutputItem[] | Destination
  ): out is Destination => {
    const output = out as Destination;
    return (
      output.to !== undefined &&
      output.amount !== undefined &&
      output.fee !== undefined &&
      output.changeAddress !== undefined
    );
  };
}
