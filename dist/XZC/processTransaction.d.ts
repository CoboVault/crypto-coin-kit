import { Result } from "../Common/sign";
declare const _default: (transaction: any, sign: (rawTx: string) => Promise<Result>, publicKey: string) => Promise<{
    txId: string;
    txHex: string;
}>;
export default _default;
