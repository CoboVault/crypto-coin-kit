// @ts-ignore
import { isValidAddress } from "ripple-address-codec";
// @ts-ignore
import { deriveAddress } from "ripple-keypairs";
import Common, { SignProvider } from "../Common";
import { TransactionBuilder, TxbProps } from "./transaction";

interface SignResult {
  signedTransaction: string;
  id: string;
}

export class XRP {
  public generateAddress = (publicKey: string) => {
    return deriveAddress(publicKey);
  };

  public isAddressValid = (address: string) => {
    return isValidAddress(address);
  };

  public generateUnsignedTransaction = (args: TxbProps) => {
    const transactionBuilder = new TransactionBuilder(args);
    return transactionBuilder.toHash();
  };

  public sign = (rawTx: string, signProvider: SignProvider) => {
    return Common.sign<SignResult>(rawTx, signProvider);
  };
}
