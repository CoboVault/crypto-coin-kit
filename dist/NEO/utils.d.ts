import { wallet } from '@cityofzion/neon-core';
import { SignProvider } from '../Common';
interface externalNeoBalance {
    address: string;
    net: string;
    balance: Array<balanceLike>;
}
declare type unspentItem = {
    value: number;
    txid: string;
    n: number;
};
interface balanceLike {
    asset_symbol: string;
    asset_hash: string;
    asset: string;
    amount: number;
    unspent: Array<unspentItem>;
}
interface claimLike {
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
export declare const buildNeoBalance: (externalNeoBalance: externalNeoBalance) => wallet.Balance;
export declare const buildNeoClaims: (address: string, net: string, externalClaims: claimLike[]) => wallet.Claims;
export {};
