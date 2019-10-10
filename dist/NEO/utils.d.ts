import { wallet } from "@cityofzion/neon-core";
import { SignProvider } from "../Common";
import { SignProviderSync } from "../Common/sign";
export interface ExternalNeoBalance {
    address: string;
    net: string;
    balance: BalanceLike[];
}
interface UnspentItem {
    value: number;
    txid: string;
    n: number;
}
interface BalanceLike {
    asset_symbol: string;
    asset_hash: string;
    asset: string;
    amount: number;
    unspent: UnspentItem[];
}
export interface ClaimLike {
    value: number;
    unclaimed: number;
    txid: string;
    sys_fee: number;
    start_height?: number;
    n: number;
    generated: number;
    end_height?: number;
}
export declare const SignProviderWithPrivateKey: (privateKey: string) => SignProvider;
export declare const SignProviderWithPrivateKeySync: (privateKey: string) => SignProviderSync;
export declare const buildNeoBalance: (externalNeoBalance: ExternalNeoBalance) => wallet.Balance;
export declare const buildNeoClaims: (address: string, net: string, externalClaims: ClaimLike[]) => wallet.Claims;
export {};
