import { SignProvider } from "../Common";
export interface Result {
    r: string;
    s: string;
}
export default class Coin {
    sign(rawTx: string, signProvider: SignProvider): Promise<any>;
}
