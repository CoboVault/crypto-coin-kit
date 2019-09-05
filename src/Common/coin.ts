import Common, { SignProvider } from "../Common";

export interface Result {
  r: string;
  s: string;
}

export default class Coin {
  public sign(rawTx: string, signProvider: SignProvider) {
    return Common.sign(rawTx, signProvider);
  }
}
