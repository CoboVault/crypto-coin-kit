// @ts-ignore
import {Transaction} from 'dcr-core';
import {Result} from '../Common/sign';
import {fromSignResultToDER, reverseBuffer} from '../utils';

const signScript = (
  transaction: any,
  sigType: number,
  index: number,
  script: any,
  sign: (rawTx: string) => Result,
) => {
  const sighash = Transaction.Sighash.sighash(
    transaction,
    sigType,
    index,
    script,
  );
  const hex = reverseBuffer(sighash).toString('hex');
  const signResult = sign(hex);
  return fromSignResultToDER(signResult);
};

const getSignatureForInput = (
  input: {
    output: any;
    prevTxId: any;
    outputIndex: any;
  },
  index: any,
  transaction: any,
  sigType: number,
  publicKey: string,
  sign: (rawTx: string) => Result,
) => {
  return new Transaction.Signature({
    publicKey,
    prevTxId: input.prevTxId,
    outputIndex: input.outputIndex,
    inputIndex: index,
    signature: signScript(
      transaction,
      sigType,
      index,
      input.output.script,
      sign,
    ),
    sigtype: sigType,
  });
};

export default (
  transaction: any,
  sign: (rawTx: string) => Result,
  publicKey: string,
  txConfig: {
    disableLargeFees: boolean;
  },
): {
  txId: string;
  txHex: string;
} => {
  const sigType = 0x01; // SIGHASH_ALL
  const inputs = transaction.inputs;
  const actions = inputs.map((input: any, index: number) => {
    return getSignatureForInput(
      input,
      index,
      transaction,
      sigType,
      publicKey,
      sign,
    );
  });
  actions.forEach((value: any[]) => {
    transaction.applySignature(value);
  });

  const txHex = transaction.serialize(txConfig);
  const txObj = transaction.toObject();
  return {
    txHex,
    txId: txObj.hash,
  };
};
