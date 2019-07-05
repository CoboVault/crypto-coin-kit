// @ts-ignore
import binary from "ripple-binary-codec";

type TransactionType = "Payment";

interface TxbProps {
  transactionType: TransactionType;
  account: string;
  destination: string;
  destinationTag?: number;
  amount: string;
  fee: string;
  sequence: number;
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

  constructor(args: TxbProps) {
    const {
      transactionType,
      account,
      amount,
      destination,
      destinationTag,
      fee,
      sequence
    } = args;
    this.transactionType = transactionType;
    this.account = account;
    this.amount = amount;
    this.destination = destination;
    this.destinationTag = destinationTag;
    this.fee = fee;
    this.sequence = sequence;
  }

  public toBinary(): string {
    return binary.encodeForSigning(this.toJSON()).toString();
  }

  private toJSON(): string {
    return JSON.stringify({
      Account: this.account,
      Amount: this.amount,
      Destination: this.destination,
      DestinationTag: this.destinationTag,
      Fee: this.fee,
      Flags: this.flags,
      Sequence: this.sequence,
      TransactionType: this.transactionType
    });
  }
}
