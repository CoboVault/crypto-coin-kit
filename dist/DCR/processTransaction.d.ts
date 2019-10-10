import { Result } from "../Common/sign";
declare const _default: (transaction: any, sign: (rawTx: string) => Promise<Result>, publicKey: string, txConfig: {
    disableLargeFees: boolean;
}) => Promise<{
    txId: string;
    txHex: string;
}>;
export default _default;
