import { MultiSignTxData, TxInputItem, TxOutputItem, Destination } from './index';
import * as bitcoin from "bitcoinjs-lib";

const MAX_FEE = 1000000;
export default class MultiSignBuilder {
  private txb: bitcoin.TransactionBuilder;
  private network: bitcoin.Network;
  constructor(network: bitcoin.Network) {
    this.network = network;
    this.txb = new bitcoin.TransactionBuilder(network, MAX_FEE);
  }

  public addInput(txData: MultiSignTxData) {
    txData.inputs.forEach(input => this.txb.addInput(input.hash, input.index));
    return this;
  }

  public addOutput(txData: MultiSignTxData) {
    if (this.isDestinationOutputs(txData.outputs)) {
      this.txb.addOutput(
        txData.outputs.to,
        txData.outputs.amount
      );
      const totalInputs = txData.inputs.reduce(
        (acc: number, cur: TxInputItem) => acc + cur.utxo.value,
        0
      );
      const changeAmount =
        totalInputs - txData.outputs.amount - txData.outputs.fee;
      this.txb.addOutput(
        txData.outputs.changeAddress,
        changeAmount
      );
    } else {
      txData.outputs.forEach(output => {
        this.txb.addOutput(output.address, output.value);
      })
    }

    return this;
  }

  public getTransactionBuilder() {
    return this.txb;
  }

  public getSign(txData: MultiSignTxData) {
    const {payment} = this.createMultiSignPayment(txData);
    const witnessScript = payment.redeem.redeem.output;
    const redeemScript = payment.redeem.output;
    return (signer: bitcoin.Signer) => {
      txData.inputs.forEach((input, index) => {
        this.txb.sign(index, signer, redeemScript, bitcoin.Transaction.SIGHASH_ALL, input.utxo.value, witnessScript)
      })
    }
  }

  private createMultiSignPayment(txData: MultiSignTxData): any {
    const { requires, publicKeys } = txData;
    const splitType = ['p2ms', 'p2wsh', 'p2sh'];
    const network = this.network;

    if (publicKeys.length === 0) {
      throw new Error('publicKeys length cannot be 0');
    }
 
    const pubkeys = publicKeys.map(publicKey => {
      return Buffer.from(publicKey, 'hex')
    })

    let payment: any;
    splitType.forEach(type => {
      if (type === 'p2ms') {
        payment = bitcoin.payments.p2ms({
          m: requires,
          pubkeys,
          network,
        });
      } else if (['p2sh', 'p2wsh'].indexOf(type) > -1) {
        payment = (bitcoin.payments as any)[type]({
          redeem: payment,
          network,
        });
      }
    });
  
    return {
      payment,
      keys: pubkeys,
    };
  }

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