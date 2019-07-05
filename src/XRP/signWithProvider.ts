import Common from "../Common";
import { SignProvider } from "../Common";

interface Result {
  signedTransaction: string;
  id: string;
}

export const signWithProvider = (rawTx: string, signProvider: SignProvider) => {
  return Common.sign<Result>(rawTx, signProvider);
};
