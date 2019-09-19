import { wallet } from "@cityofzion/neon-core";
import CoinDeprecated from "../Common/coin";
import { SignProviderDeprecated } from "../Common";
export interface txData {
    tokenName: string;
    to: string;
    amount: number;
    memo?: string;
    balance: wallet.Balance;
}
export default class NEO extends CoinDeprecated {
    static utils: {
        SignProviderWithPrivateKey: (privateKey: string) => SignProviderDeprecated;
        buildNeoBalance: (externalNeoBalance: import("./utils").externalNeoBalance) => wallet.Balance;
        buildNeoClaims: (address: string, net: string, externalClaims: import("./utils").claimLike[]) => wallet.Claims;
    };
    generateAddress(publicKey: string): string;
    generateUnsignedContractTx(txData: txData): string;
    signMessage(hex: string, signer: SignProviderDeprecated): Promise<any>;
    verifyMessage(sig: string, hex: string, pubkey: string): boolean;
    generateUnsignedClaimTx(claims: wallet.Claims): string;
}
