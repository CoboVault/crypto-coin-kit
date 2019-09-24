// @ts-ignore
import { Address, PublicKey, Transaction } from "dcr-core";
import { SignProvider, SignProviderSync } from "../Common";
import { Coin } from "../Common/coin";
import { fromSignResultToDER, hash256, numberToHex } from "../utils";
import formatInput from "./formatInput";
import processTransaction from "./processTransaction";
import processTransactionSync from "./processTransactionSync";

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
  amount: number; // sat
  to: string;
  fee: number; // sat
}

export class DCR implements Coin {
  protected network: string;
  constructor() {
    this.network = "dcrdlivenet";
  }
  public generateAddress = (publicKey: string) => {
    const pubkey = new PublicKey(publicKey);
    // only support P2PKH now
    return Address.fromPublicKey(pubkey, this.network).toString();
  };

  public isAddressValid = (address: string) => {
    return Address.isValid(address);
  };

  public generateTransaction = async (
    txData: TxData,
    signer: SignProvider,
    options: {
      signerPubkey: string;
      disableLargeFees: boolean;
    }
  ): Promise<{
    txId: string;
    txHex: string;
  }> => {
    const { inputs, changeAddress, to, fee, amount } = txData;
    const transaction = new Transaction()
      .from(formatInput(inputs))
      .to(to, amount)
      .fee(fee)
      .change(changeAddress);
    return processTransaction(transaction, signer.sign, options.signerPubkey, options);
  };

  public generateTransactionSync = (
    txData: TxData,
    signer: SignProviderSync,
    options: {
      signerPubkey: string;
      disableLargeFees: boolean;
    }
  ): {
    txId: string;
    txHex: string;
  } => {
    const { inputs, changeAddress, to, fee, amount } = txData;
    const transaction = new Transaction()
      .from(formatInput(inputs))
      .to(to, amount)
      .fee(fee)
      .change(changeAddress);
    return processTransactionSync(transaction, signer.sign, options.signerPubkey, options);
  };

  public signMessage = async (message: string, signer: SignProvider) => {
    const MAGIC_BYTES = Buffer.from("\x16Decred Signed Message:\n", "utf-8");
    const messageBuffer = Buffer.from(message, "utf-8");
    const messageLength = Buffer.from(numberToHex(messageBuffer.length), "hex");
    const buffer = Buffer.concat([MAGIC_BYTES, messageLength, messageBuffer]);
    const hashHex = hash256(buffer).toString("hex");
    const signResult = await signer.sign(hashHex);
    return fromSignResultToDER(signResult);
  };

  public signMessageSync = (message: string, signer: SignProviderSync) => {
    const MAGIC_BYTES = Buffer.from("\x16Decred Signed Message:\n", "utf-8");
    const messageBuffer = Buffer.from(message, "utf-8");
    const messageLength = Buffer.from(numberToHex(messageBuffer.length), "hex");
    const buffer = Buffer.concat([MAGIC_BYTES, messageLength, messageBuffer]);
    const hashHex = hash256(buffer).toString("hex");
    const signResult = signer.sign(hashHex);
    return fromSignResultToDER(signResult);
  };
}
