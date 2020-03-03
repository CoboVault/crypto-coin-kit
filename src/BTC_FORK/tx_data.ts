export interface TxOutputItem {
    address: string;
    value: number;
}

export interface TxInputItem {
    hash: string;
    index: number;
    value: number;
    pubkey: string;
}

export interface TxData {
    inputs: TxInputItem[];
    outputs: TxOutputItem[];
}
