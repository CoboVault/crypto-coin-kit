import { wallet } from '@cityofzion/neon-js'

export default class NEO {
    public generateAddress(publicKey: string) {
        const account = new wallet.Account(publicKey)
        return account.address
    }
}