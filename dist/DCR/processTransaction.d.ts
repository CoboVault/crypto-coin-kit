import { Result } from "../Common/coin";
declare const _default: (transaction: any, sign: (rawTx: string) => Promise<Result>, publicKey: string) => Promise<{
    txId: string;
    txHex: string;
}>;
export default _default;
