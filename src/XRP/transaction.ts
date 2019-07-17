// @ts-ignore
import BN from "bn.js";
import hashjs from "hash.js";
// @ts-ignore
import binary from "ripple-binary-codec";
// @ts-ignore
import { computeBinaryTransactionHash } from "ripple-hashes";
import { bytesToHex, toDER } from "../utils";

type TransactionType = "Payment" | "AccountSet";

export interface TxbProps {
  transactionType: TransactionType;
  account: string;
  destination: string;
  destinationTag?: number;
  amount: string;
  fee: string;
  sequence: number;
  signingPubKey: string;
}

export class TransactionBuilder {
  private readonly flags = 2147483648;
  private readonly transactionType: string;
  private readonly destination: string;
  private readonly destinationTag?: number;
  private readonly account: string;
  private readonly amount: string;
  private readonly fee: string;
  private readonly sequence: number;
  private readonly signingPubKey: string;
  private txnSignature?: string;

  constructor(args: TxbProps) {
    const {
      transactionType,
      account,
      amount,
      destination,
      destinationTag,
      fee,
      sequence,
      signingPubKey
    } = args;
    this.transactionType = transactionType;
    this.account = account;
    this.amount = amount;
    this.destination = destination;
    this.destinationTag = destinationTag;
    this.fee = fee;
    this.sequence = sequence;
    this.signingPubKey = signingPubKey;
  }

  public getUnsignedTx(): string {
    const txBytes = this.toBytes();
    return bytesToHex(
      Buffer.from(
        hashjs
          .sha512()
          .update(txBytes)
          .digest()
          .slice(0, 32)
      )
    );
  }

  public addSignature(signature: string): void {
    this.txnSignature = toDER(signature);
  }

  public getSignedTx(): { id: string; txBlob: string } {
    const txBlob = binary.encode(this.toJSON());
    const id = computeBinaryTransactionHash(txBlob);
    return {
      id,
      txBlob
    };
  }

  private toBytes(): ArrayBuffer {
    const txHex = this.toHex();
    return new BN(txHex, 16).toArray(null, txHex.length / 2);
  }

  private toHex(): string {
    const txJson = this.toJSON();
    if (txJson.hasOwnProperty("TxnSignature")) {
      throw new Error("can not encode a signed tx");
    }
    return binary.encodeForSigning(txJson);
  }

  // parse current instance to JSON
  private toJSON(): any {
    const partialTx = {
      Account: this.account,
      Amount: this.amount,
      Destination: this.destination,
      Fee: this.fee,
      Flags: this.flags,
      Sequence: this.sequence,
      TransactionType: this.transactionType,
      SigningPubKey: this.signingPubKey
    };
    // DestinationTag: undefined or null will produce an unexpected 2E00000000 hex fragment in unsigned TX;
    const txWithDetinationTag = this.destinationTag
      ? { ...partialTx, DestinationTag: this.destinationTag }
      : partialTx;

    // if this is a signed tx
    return this.txnSignature
      ? { ...txWithDetinationTag, TxnSignature: this.txnSignature }
      : txWithDetinationTag;
  }
}
