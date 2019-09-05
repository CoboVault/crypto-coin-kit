// @ts-ignore
import { isValidAddress } from "ripple-address-codec";
// @ts-ignore
import { deriveAddress } from "ripple-keypairs";
import Coin from "../Common/coin";
import { TransactionBuilder, TxbProps } from "./transaction";

export class XRP extends Coin {
  public generateAddress = (publicKey: string) => {
    return deriveAddress(publicKey);
  };

  public isAddressValid = (address: string) => {
    return isValidAddress(address);
  };

  public generateTxBuilder = (args: TxbProps) => {
    return new TransactionBuilder(args);
  };
}
