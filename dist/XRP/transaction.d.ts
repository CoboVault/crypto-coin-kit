declare type TransactionType = "Payment" | "AccountSet";
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
export declare class TransactionBuilder {
    private readonly flags;
    private readonly transactionType;
    private readonly destination;
    private readonly destinationTag?;
    private readonly account;
    private readonly amount;
    private readonly fee;
    private readonly sequence;
    private readonly signingPubKey;
    private txnSignature?;
    constructor(args: TxbProps);
    getUnsignedTx(): string;
    addSignature(signature: string): void;
    getSignedTx(): {
        id: string;
        txBlob: string;
    };
    private toBytes;
    private toHex;
    private toJSON;
}
export {};
