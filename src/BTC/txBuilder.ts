import {crypto} from "bitcoinjs-lib";
import * as bitcoin from "bitcoinjs-lib";
// @ts-ignore
import padstart from 'lodash.padstart';
import {
  Destination,
  NonWitnessUtxo, OmniTxData,
  TxData,
  TxInputItem,
  TxOutputItem,
  WitnessUtxo
} from "./index";

const MAX_FEE = 1000000;
export const DUST_AMOUNT = 546; // sat unit
export const USDT_PROPERTYID_MAINNET = 31;
export const USDT_PROPERTYID_TESTNET = 1;

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
        return this.addInputForPsbt(eachInput);
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

  public calculateScript = (publicKey: string) => {
    const p2wpkh = bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(publicKey,'hex'),
      network: this.network
    });

    const p2sh = bitcoin.payments.p2sh({
      redeem: p2wpkh,
      network: this.network });

    const script = bitcoin.script.compile([
        bitcoin.script.OPS.OP_HASH160,
        // @ts-ignore
        crypto.hash160(p2sh.redeem.output),
        bitcoin.script.OPS.OP_EQUAL,
    ]);

    return script;
  };

  public verifyOmniInput = (txData:OmniTxData) => {
      const totalInputs = txData.inputs.reduce(
          (acc: number, cur: TxInputItem) => acc + cur.utxo.value,
          0
      );
      return totalInputs >= DUST_AMOUNT + txData.fee;
  };

  public generateOmniPayload = (amount:number, propertyId:number):Buffer => {
      const hexAmount = padstart(amount.toString(16), 16, '0').toUpperCase();
      const simpleSend = [
            '6f6d6e69', // omni
            '0000', // version
            padstart(propertyId.toString(16), 12, '0'),
            hexAmount,
        ].join('');
        const data = [Buffer.from(simpleSend, 'hex')];
        // @ts-ignore
        return bitcoin.payments.embed({ data }).output;
    };

  public buildOmniPsbt = (omniTxData:OmniTxData)=>{
      const totalInputs = omniTxData.inputs.reduce(
          (acc: number, cur: TxInputItem) => acc + cur.utxo.value,
          0
      );
      if(totalInputs >= DUST_AMOUNT + omniTxData.fee) {
          omniTxData.inputs.forEach(input => this.addInputForPsbt(input));
          this.psbt.addOutput({
              address: omniTxData.to,
              value: DUST_AMOUNT,
          });

          const propertyID = this.network === bitcoin.networks.bitcoin ?
              USDT_PROPERTYID_MAINNET : USDT_PROPERTYID_TESTNET;
          this.psbt.addOutput({
              script: this.generateOmniPayload(omniTxData.omniAmount,propertyID),
              value:0
          });
          const change = totalInputs - DUST_AMOUNT - omniTxData.fee;
          if (change > 0) {
              this.psbt.addOutput({
                  address: omniTxData.changeAddress,
                  value: change
              })
          }
          return this;
      } else {
          throw new Error("input value are invalid");
      }
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

    private addInputForPsbt(eachInput:TxInputItem) {
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
                    script: Buffer.from(eachInput.utxo.script ||
                        this.calculateScript(eachInput.utxo.publicKey).toString('hex'),
                        "hex"),
                    value: eachInput.utxo.value
                },
                redeemScript: bitcoin.payments.p2wpkh({
                    pubkey: Buffer.from(eachInput.utxo.publicKey, "hex"),
                    network: this.network
                }).output
            });
        }
    }

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
