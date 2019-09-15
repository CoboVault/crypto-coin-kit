// @ts-ignore
import { Address, PublicKey, Transaction } from "dcr-core";
import { SignProvider } from "../Common";
import Coin from "../Common/coin";
import { fromSignResultToDER, hash256, numberToHex } from "../utils";
import formatInput from "./formatInput";
import processTransaction from "./processTransaction";

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

export class DCR extends Coin {
  protected network: string;
  constructor() {
    super();
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
    signProvider: SignProvider,
    options: {
      publicKey: string;
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
    const sign = async (hex: string) => this.sign(hex, signProvider);
    return processTransaction(transaction, sign, options.publicKey);
  };

  public signMessage = async (message: string, signProvider: SignProvider) => {
    const MAGIC_BYTES = Buffer.from("\x16Decred Signed Message:\n", "utf-8");
    const messageBuffer = Buffer.from(message, "utf-8");
    const messageLength = Buffer.from(numberToHex(messageBuffer.length), "hex");
    const buffer = Buffer.concat([MAGIC_BYTES, messageLength, messageBuffer]);
    const hashHex = hash256(buffer).toString("hex");
    const sign = async (hex: string) => this.sign(hex, signProvider);
    const signResult = await sign(hashHex);
    return fromSignResultToDER(signResult);
  };
}
