import { tx, wallet, } from '@cityofzion/neon-core'
import { SignProvider } from '../Common';

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
    unspent: unspentItem[]
}

export interface claimLike {
    value: number;
    unclaimed: number;
    txid: string;
    sys_fee: number;
    start_height?: number,
    n: number;
    generated: number;
    end_height?: number;
}

export const SignProviderWithPrivateKey = (privateKey: string): SignProvider => {
    return {
        sign: (hex: string) => {
            const signedTx = tx.Transaction.deserialize(hex).sign(privateKey)

            return {
                hex: signedTx.serialize(),
                id: signedTx.hash
            }
        },
        signMessage: (hex: string) => {
            return wallet.sign(hex, privateKey)
        }
    }
}

export const buildNeoBalance = (externalNeoBalance: externalNeoBalance) => {
    const address = externalNeoBalance.address;
    const net = externalNeoBalance.net;

    const assetSymbols: string[] = [];
    const assets: {
        [sym: string]: Partial<wallet.AssetBalanceLike>;
    } = {};

    const tokenSymbols: string[] = [];
    const tokens: {
        [sym: string]: number
    } = {};

    const isAsset = (amount: number, unspent: unspentItem[]) => {
        if (amount === 0 && unspent.length === 0) { return true; }
        if (amount !== 0 && unspent.length === 0) { return false; }
        if (amount !== 0 && unspent.length !== 0) { return true; }
        return true;
    }


    externalNeoBalance.balance.forEach(each => {
        if (isAsset(each.amount, each.unspent)) {
            tokenSymbols.push(each.asset_symbol)
            assets[each.asset_symbol] = {
                balance: each.amount,
                unspent: each.unspent.map(eachUnspent => ({
                    value: eachUnspent.value,
                    txid: eachUnspent.txid,
                    index: eachUnspent.n
                }))
            }
        } else {
            tokenSymbols.push(each.asset_symbol)
            tokens[each.asset_symbol] = each.amount
        }
    })


    return new wallet.Balance({
        address,
        net,
        assetSymbols,
        assets,
        tokens,
        tokenSymbols,
    })
}


export const buildNeoClaims = (address: string, net: string, externalClaims: claimLike[]) => {
    const claims: wallet.ClaimItemLike[] = externalClaims.map(each => ({
        claim: each.unclaimed,
        txid: each.txid,
        index: each.n,
        value: each.value,
        start: each.start_height,
        end: each.end_height
    }))
    return new wallet.Claims({
        address,
        net,
        claims
    })
}