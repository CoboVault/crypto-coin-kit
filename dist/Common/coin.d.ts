import { SignProvider } from "../Common";
interface result {
    hex: string;
    id: string;
}
export default class Coin {
    sign(rawTx: string, signProvider: SignProvider): Promise<result>;
}
export {};
