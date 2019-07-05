import { derive, isValid } from "./address";
import { signWithProvider } from "./signWithProvider";
import { TransactionBuilder } from "./transaction";

export default {
  address: {
    derive,
    isValid
  },
  TransactionBuilder,
  signWithProvider
};
