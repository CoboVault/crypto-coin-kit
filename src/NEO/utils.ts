import { tx, wallet, } from '@cityofzion/neon-core'
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
    }>

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

    externalNeoBalance.balance.forEach(each => {
        if (each['asset_symbol']) {
            assetSymbols.push(each['asset_symbol'])
            assets[each['asset_symbol']] = {
                balance: each['amount'],
                unspent: each.unspent.map(eachUnspent => ({
                    value: eachUnspent['value'],
                    txid: eachUnspent['txid'],
                    index: eachUnspent['n']
                }))
            }
        }
    })


    return new wallet.Balance({
        address,
        net,
        assetSymbols,
        assets
    })
}