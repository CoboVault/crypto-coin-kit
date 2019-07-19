import { wallet, tx } from '@cityofzion/neon-core'
import Common, { SignProvider } from "../Common";

interface SignResult {
    hex: string;
    id: string;
}
export interface txData{
    to: string;
    amount: number;
    memo?: string;
    balance: wallet.Balance

}
export default class NEO {
    public generateAddress(publicKey: string) {
        const account = new wallet.Account(publicKey)
        return account.address
    }

    public generateUnsignedTransaction(txData: txData) {
        const coinTx = new tx.ContractTransaction()
        .addIntent('NEO', txData['amount'], txData['to'])
        
        if(txData['memo']) {
            coinTx.addRemark(txData['memo'])
        }

        coinTx.calculate(txData['balance'])
        return coinTx.serialize(false)
    }


    public sign (rawTx: string, signProvider: SignProvider){
        return Common.sign<SignResult>(rawTx, signProvider);
      };
}