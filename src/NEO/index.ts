import { wallet, tx } from '@cityofzion/neon-core'
import Coin from "../Common/coin";
import { SignProviderWithPrivateKey, buildNeoBalance, buildNeoClaims } from './utils'

export interface txData{
    tokenName: string;
    to: string;
    amount: number;
    memo?: string;
    balance: wallet.Balance

}
export default class NEO extends Coin{
    public static utils = {
        SignProviderWithPrivateKey,
        buildNeoBalance,
        buildNeoClaims
    }

    public generateAddress(publicKey: string) {
        const account = new wallet.Account(publicKey)
        return account.address
    }

    public generateUnsignedContractTx(txData: txData) {
        const coinTx = new tx.ContractTransaction()
        .addIntent(txData['tokenName'], txData['amount'], txData['to'])
        
        if(txData['memo']) {
            coinTx.addRemark(txData['memo'])
        }

        coinTx.calculate(txData['balance'])
        return coinTx.serialize(false)
    }

    public generateUnsignedClaimTx(claims: wallet.Claims) {
        const claimTx = tx.ClaimTransaction.fromClaims(claims)
        return claimTx.serialize(false)
    }
}