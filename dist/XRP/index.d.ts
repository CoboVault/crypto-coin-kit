import CoinDeprecated from "../Common/coin";
import { TransactionBuilder, TxbProps } from "./transaction";
export declare class XRP extends CoinDeprecated {
    generateAddress: (publicKey: string) => any;
    isAddressValid: (address: string) => any;
    generateTxBuilder: (args: TxbProps) => TransactionBuilder;
}
