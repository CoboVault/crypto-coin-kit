import {crypto} from 'bitcoinjs-lib';
import * as bitcoin from 'bitcoinjs-lib';
// @ts-ignore
import padstart from 'lodash.padstart';
import {
  Destination,
  MultiSignTxData,
  MultiSignTxInputItem,
  MultiSignWitnessUtxo,
  NonWitnessUtxo,
  OmniTxData,
  TxData,
  TxInputItem,
  TxOutputItem,
  WitnessUtxo,
} from './index';

const MAX_FEE = 1000000;
export const DUST_AMOUNT = 546; // sat unit
export const USDT_PROPERTYID_MAINNET = 31;
export const USDT_PROPERTYID_TESTNET = 1;

export default class PsbtBuilder {
  private psbt: bitcoin.Psbt;
  private network: bitcoin.Network;
  constructor(network: bitcoin.Network) {
    this.network = network;
    this.psbt = new bitcoin.Psbt({network});
  }

  public addInputsForPsbt = (txData: TxData) => {
    if (this.verifyInput(txData)) {
      txData.inputs.forEach(eachInput => {
        return this.addInputForPsbt(eachInput);
      });
      return this;
    }
    throw new Error('input value are invaild');
  };

  public addMultiSignInputsForPsbt = (txData: MultiSignTxData) => {
    if (this.verifyInput(txData)) {
      txData.inputs.forEach((eachInput: MultiSignTxInputItem) => {
        const inputData = this.getMultiSignInputData(
          eachInput,
          txData.requires,
        );
        return this.psbt.addInput(inputData);
      });
      return this;
    }
    throw new Error('input value are invaild');
  };

  public addOutputForPsbt = (txData: TxData | MultiSignTxData) => {
    if (this.isDestinationOutputs(txData.outputs)) {
      this.psbt.addOutput({
        address: txData.outputs.to,
        value: txData.outputs.amount,
      });
      // @ts-ignore
      const totalInputs = txData.inputs.reduce(
        (acc: number, cur: TxInputItem | MultiSignTxInputItem) =>
          acc + cur.utxo.value,
        0,
      );
      const changeAmount =
        totalInputs - txData.outputs.amount - txData.outputs.fee;
      this.psbt.addOutput({
        address: txData.outputs.changeAddress,
        value: changeAmount,
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
      pubkey: Buffer.from(publicKey, 'hex'),
      network: this.network,
    });

    const p2sh = bitcoin.payments.p2sh({
      redeem: p2wpkh,
      network: this.network,
    }) as any;

    const script = this.compileScript(p2sh.redeem.output);

    return script;
  };

  public verifyOmniInput = (txData: OmniTxData) => {
    const totalInputs = txData.inputs.reduce(
      (acc: number, cur: TxInputItem) => acc + cur.utxo.value,
      0,
    );
    return totalInputs >= DUST_AMOUNT + txData.fee;
  };

  public generateOmniPayload = (amount: number, propertyId: number): Buffer => {
    const hexAmount = padstart(amount.toString(16), 16, '0').toUpperCase();
    const simpleSend = [
      '6f6d6e69', // omni
      '0000', // version
      padstart(propertyId.toString(16), 12, '0'),
      hexAmount,
    ].join('');
    const data = [Buffer.from(simpleSend, 'hex')];
    // @ts-ignore
    return bitcoin.payments.embed({data}).output;
  };

  public buildOmniPsbt = (omniTxData: OmniTxData) => {
    const totalInputs = omniTxData.inputs.reduce(
      (acc: number, cur: TxInputItem) => acc + cur.utxo.value,
      0,
    );
    if (totalInputs >= DUST_AMOUNT + omniTxData.fee) {
      omniTxData.inputs.forEach(input => this.addInputForPsbt(input));
      this.psbt.addOutput({
        address: omniTxData.to,
        value: DUST_AMOUNT,
      });

      const usdtPropertyId =
        this.network === bitcoin.networks.bitcoin
          ? USDT_PROPERTYID_MAINNET
          : USDT_PROPERTYID_TESTNET;
      this.psbt.addOutput({
        script: this.generateOmniPayload(
          omniTxData.omniAmount,
          omniTxData.propertyId || usdtPropertyId,
        ),
        value: 0,
      });
      const change = totalInputs - DUST_AMOUNT - omniTxData.fee;
      if (change > DUST_AMOUNT) {
        this.psbt.addOutput({
          address: omniTxData.changeAddress,
          value: change,
        });
      }
      return this;
    } else {
      throw new Error('input value are invalid');
    }
  };

  private verifyInput = (
    txData: TxData | MultiSignTxData,
    disableLargeFee = true,
  ) => {
    // @ts-ignore
    const totalInputs = txData.inputs.reduce(
      (acc: number, cur: TxInputItem | MultiSignTxInputItem) =>
        acc + cur.utxo.value,
      0,
    );
    if (this.isDestinationOutputs(txData.outputs)) {
      if (totalInputs >= txData.outputs.fee + txData.outputs.amount) {
        return true;
      }
    } else {
      const totalOuputs = txData.outputs.reduce(
        (acc: number, cur: TxOutputItem) => acc + cur.value,
        0,
      );
      const fee = totalInputs - totalOuputs;
      if (fee >= 0 && (disableLargeFee ? fee < MAX_FEE : true)) {
        return true;
      }
    }
    return false;
  };

  private addInputForPsbt(eachInput: TxInputItem) {
    if (this.isNonWitnessUtxo(eachInput.utxo)) {
      return this.psbt.addInput({
        hash: eachInput.hash,
        index: eachInput.index,
        sequence: eachInput.sequence,
        nonWitnessUtxo: Buffer.from(eachInput.utxo.nonWitnessUtxo, 'hex'),
        bip32Derivation: eachInput.bip32Derivation,
      });
    } else {
      return this.psbt.addInput({
        hash: eachInput.hash,
        index: eachInput.index,
        sequence: eachInput.sequence,
        witnessUtxo: {
          script: Buffer.from(
            eachInput.utxo.script ||
              this.calculateScript(eachInput.utxo.publicKey).toString('hex'),
            'hex',
          ),
          value: eachInput.utxo.value,
        },
        redeemScript: bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(eachInput.utxo.publicKey, 'hex'),
          network: this.network,
        }).output,
        bip32Derivation: eachInput.bip32Derivation,
      });
    }
  }

  private getMultiSignInputData(
    eachInput: MultiSignTxInputItem,
    requires: number,
  ) {
    if (this.isNonWitnessUtxo(eachInput.utxo)) {
      return {
        hash: eachInput.hash,
        index: eachInput.index,
        nonWitnessUtxo: Buffer.from(eachInput.utxo.nonWitnessUtxo, 'hex'),
      };
    }

    const {payment} = this.createMultiSignPayment(
      requires,
      eachInput.utxo.publicKeys,
    );

    const witnessUtxoScript = this.compileScript(payment.redeem.output);

    return {
      hash: eachInput.hash,
      index: eachInput.index,
      witnessUtxo: {
        script: Buffer.from(
          eachInput.utxo.script || witnessUtxoScript.toString('hex'),
          'hex',
        ),
        value: eachInput.utxo.value,
      },
      witnessScript: payment.redeem.redeem.output,
      redeemScript: payment.redeem.output,
    };
  }

  private createMultiSignPayment(requires: number, publicKeys: string[]): any {
    const network = this.network;

    if (publicKeys.length === 0) {
      throw new Error('publicKeys length cannot be 0');
    }

    const pubkeys = publicKeys.map(publicKey => {
      return Buffer.from(publicKey, 'hex');
    });

    const p2ms = bitcoin.payments.p2ms({m: requires, pubkeys, network});
    const p2wsh = bitcoin.payments.p2wsh({redeem: p2ms, network});
    const p2sh = bitcoin.payments.p2sh({redeem: p2wsh, network});

    return {
      payment: p2sh,
      keys: pubkeys,
    };
  }

  private compileScript(script: Buffer) {
    return bitcoin.script.compile([
      bitcoin.script.OPS.OP_HASH160,
      // @ts-ignore
      crypto.hash160(script),
      bitcoin.script.OPS.OP_EQUAL,
    ]);
  }

  private isNonWitnessUtxo = (
    utxo: WitnessUtxo | NonWitnessUtxo | MultiSignWitnessUtxo,
  ): utxo is NonWitnessUtxo => {
    return (utxo as NonWitnessUtxo).nonWitnessUtxo !== undefined;
  };

  private isDestinationOutputs = (
    out: TxOutputItem[] | Destination,
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
