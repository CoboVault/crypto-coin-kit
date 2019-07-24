import { wallet } from '@cityofzion/neon-core';
import { SignProvider } from '../Common';
interface externalNeoBalance {
    address: string;
    net: string;
    balance: Array<balanceLike>;
}
interface balanceLike {
    asset_symbol: string;
    asset_hash: string;
    asset: string;
    amount: number;
    unspent: Array<{
        value: number;
        txid: string;
        n: number;
    }>;
}
export declare const SignProviderWithPrivateKey: (privateKey: string) => SignProvider;
export declare const buildNeoBalance: (externalNeoBalance: externalNeoBalance) => wallet.Balance;
export {};
