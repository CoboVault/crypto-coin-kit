import { tx, wallet, } from '@cityofzion/neon-core'
import { SignProvider } from '../Common';

interface externalNeoBalance {
    address: string;
    net: string;
    balance: Array<balanceLike>;
}

type unspentItem = {
        value: number;
        txid: string;
        n: number;
}

interface balanceLike {
    asset_symbol: string;
    asset_hash: string;
    asset: string;
    amount: number;
    unspent: Array<unspentItem>

}

export const SignProviderWithPrivateKey = (privateKey: string): SignProvider => {
    return {
        sign: (hex: string) => {
            const signedTx = tx.Transaction.deserialize(hex).sign(privateKey)

            return {
                hex: signedTx.serialize(),
                id: signedTx.hash
            }
        }
    }
}

export const buildNeoBalance = (externalNeoBalance: externalNeoBalance) => {
    const address = externalNeoBalance['address'];
    const net = externalNeoBalance['net'];

    let assetSymbols: string[] = [];
    let assets: {
        [sym: string]: Partial<wallet.AssetBalanceLike>;
    } = {};

    let tokenSymbols: string[] = [];
    let tokens: {
        [sym: string]: number
    } = {};

    const isAsset = (amount: number, unspent: Array<unspentItem>) => {
        if(amount === 0 && unspent.length ===0) return true;
        if(amount !== 0 && unspent.length === 0) return false;
        if(amount !== 0 && unspent.length !== 0) return true;
        return true;
    }


    externalNeoBalance.balance.forEach(each => {
        if (isAsset(each['amount'], each['unspent'])) {
            tokenSymbols.push(each['asset_symbol'])
            assets[each['asset_symbol']] = {
                balance: each['amount'],
                unspent: each.unspent.map(eachUnspent => ({
                    value: eachUnspent['value'],
                    txid: eachUnspent['txid'],
                    index: eachUnspent['n']
                }))
            }
        } else {
            tokenSymbols.push(each['asset_symbol'])
            tokens[each['asset_symbol']] = each['amount']
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