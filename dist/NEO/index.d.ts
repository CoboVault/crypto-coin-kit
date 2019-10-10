import { wallet } from "@cityofzion/neon-core";
import { SignProvider, SignProviderSync } from "../Common";
import { Coin } from "../Common/coin";
export interface TxData {
    tokenName: string;
    to: string;
    amount: number;
    memo?: string;
    balance: wallet.Balance;
}
export default class NEO implements Coin {
    static utils: {
        SignProviderWithPrivateKey: (privateKey: string) => SignProvider;
        buildNeoBalance: (externalNeoBalance: import("./utils").ExternalNeoBalance) => wallet.Balance;
        buildNeoClaims: (address: string, net: string, externalClaims: import("./utils").ClaimLike[]) => wallet.Claims;
    };
    network: string;
    constructor(network?: string);
    generateAddress: (publicKey: string) => string;
    isAddressValid: (address: string) => boolean;
    generateTransaction: (txData: TxData, signProvider: SignProvider, options: {
        signerPubkey: string;
    }) => Promise<{
        txHex: string;
        txId: string;
    }>;
    generateTransactionSync: (txData: TxData, signProvider: SignProviderSync, options: {
        signerPubkey: string;
    }) => {
        txHex: string;
        txId: string;
    };
    /**
     * @returns the return value is the promise of (r,s) of the signature
     */
    signMessage: (message: string, signer: SignProvider) => Promise<string>;
    /**
     * @returns the return value is the (r,s) of the signature
     */
    signMessageSync: (message: string, signer: SignProviderSync) => string;
    private composeUnsignedTx;
    private composeSignedObject;
}
