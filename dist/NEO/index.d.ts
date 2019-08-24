import { wallet } from '@cityofzion/neon-core';
import Coin from "../Common/coin";
import { SignProvider } from '../Common';
export interface txData {
    tokenName: string;
    to: string;
    amount: number;
    memo?: string;
    balance: wallet.Balance;
}
export default class NEO extends Coin {
    static utils: {
        SignProviderWithPrivateKey: (privateKey: string) => SignProvider;
        buildNeoBalance: (externalNeoBalance: import("./utils").externalNeoBalance) => wallet.Balance;
        buildNeoClaims: (address: string, net: string, externalClaims: import("./utils").claimLike[]) => wallet.Claims;
    };
    generateAddress(publicKey: string): string;
    generateUnsignedContractTx(txData: txData): string;
    signMessage(hex: string, signer: SignProvider): Promise<string>;
    verifyMessage(sig: string, hex: string, pubkey: string): boolean;
    generateUnsignedClaimTx(claims: wallet.Claims): string;
}
