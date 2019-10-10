import { Result } from "../Common/sign";
declare const _default: (transaction: any, sign: (rawTx: string) => Result, publicKey: string, txConfig: {
    disableLargeFees: boolean;
}) => {
    txId: string;
    txHex: string;
};
export default _default;
