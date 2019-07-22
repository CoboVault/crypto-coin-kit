import Common, { SignProvider } from "../Common";

interface result{
    hex: string,
    id: string
}

export default class Coin {
    public sign (rawTx: string, signProvider: SignProvider){
        return Common.sign<result>(rawTx, signProvider);
    };
}