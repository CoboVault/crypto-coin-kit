// @ts-ignore
import { Address, PublicKey, Transaction } from "dcr-core";
import { SignProvider, SignProviderSync } from "../Common";
import { Coin } from "../Common/coin";
import { hash256, numberToHex } from "../utils";
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

interface Options {
  signerPubkey: string;
  disableLargeFees?: boolean;
}

export class DCR implements Coin {
  protected network: string;
  constructor(network?: string) {
    this.network = network || "dcrdlivenet";
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
    { disableLargeFees = true, ...options }: Options
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
    return processTransaction(transaction, signer.sign, options.signerPubkey, {
      disableLargeFees
    });
  };

  public generateTransactionSync = (
    txData: TxData,
    signer: SignProviderSync,
    { disableLargeFees = true, ...options }: Options
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
    return processTransactionSync(
      transaction,
      signer.sign,
      options.signerPubkey,
      { disableLargeFees }
    );
  };

  /**
   * @returns the return value is the (r,s) of the signature
   */
  public signMessage = async (message: string, signer: SignProvider) => {
    const hashHex = this.getSignMessageHex(message);
    const result = await signer.sign(hashHex);
    return `${result.r}${result.s}`;
  };

  /**
   * @returns the return value is the (r,s) of the signature
   */
  public signMessageSync = (message: string, signer: SignProviderSync) => {
    const hashHex = this.getSignMessageHex(message);
    const result = signer.sign(hashHex);
    return `${result.r}${result.s}`;
  };

  private getSignMessageHex = (message: string) => {
    const MAGIC_BYTES = Buffer.from("\x16Decred Signed Message:\n", "utf-8");
    const messageBuffer = Buffer.from(message, "utf-8");
    const messageLength = Buffer.from(numberToHex(messageBuffer.length), "hex");
    const buffer = Buffer.concat([MAGIC_BYTES, messageLength, messageBuffer]);

    return hash256(buffer).toString("hex");
  };
}
