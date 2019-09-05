import { tx, wallet } from "@cityofzion/neon-core";
import Coin from "../Common/coin";
import {
  buildNeoBalance,
  buildNeoClaims,
  SignProviderWithPrivateKey
} from "./utils";
import { SignProvider } from "../Common";

export interface txData {
  tokenName: string;
  to: string;
  amount: number;
  memo?: string;
  balance: wallet.Balance;
}
export default class NEO extends Coin {
  public static utils = {
    SignProviderWithPrivateKey,
    buildNeoBalance,
    buildNeoClaims
  };

  public generateAddress(publicKey: string) {
    const account = new wallet.Account(publicKey);
    return account.address;
  }

  public generateUnsignedContractTx(txData: txData) {
    const coinTx = new tx.ContractTransaction().addIntent(
      txData.tokenName,
      txData.amount,
      txData.to
    );

    if (txData.memo) {
      coinTx.addRemark(txData.memo);
    }

    coinTx.calculate(txData.balance);
    return coinTx.serialize(false);
  }

  public async signMessage(hex: string, signer: SignProvider) {
    return signer.signMessage && signer.signMessage(hex);
  }

  public verifyMessage(sig: string, hex: string, pubkey: string) {
    return wallet.verify(hex, sig, pubkey);
  }

  public generateUnsignedClaimTx(claims: wallet.Claims) {
    const claimTx = tx.ClaimTransaction.fromClaims(claims);
    return claimTx.serialize(false);
  }
}
