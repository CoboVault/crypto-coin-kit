import { wallet } from "@cityofzion/neon-core";
import { SignProviderDeprecated } from "../Common";
export interface externalNeoBalance {
    address: string;
    net: string;
    balance: balanceLike[];
}
interface unspentItem {
    value: number;
    txid: string;
    n: number;
}
interface balanceLike {
    asset_symbol: string;
    asset_hash: string;
    asset: string;
    amount: number;
    unspent: unspentItem[];
}
export interface claimLike {
    value: number;
    unclaimed: number;
    txid: string;
    sys_fee: number;
    start_height?: number;
    n: number;
    generated: number;
    end_height?: number;
}
export declare const SignProviderWithPrivateKey: (privateKey: string) => SignProviderDeprecated;
export declare const buildNeoBalance: (externalNeoBalance: externalNeoBalance) => wallet.Balance;
export declare const buildNeoClaims: (address: string, net: string, externalClaims: claimLike[]) => wallet.Claims;
export {};
