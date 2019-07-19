import { wallet, tx } from '@cityofzion/neon-core'
import { SignProvider } from '../Common';
import { identifier } from '@babel/types';

// export interface utxo {

// }

// const genereateNeoBalance = (address:string, ) => {
//     return new wallet.Balance({
//         address,
//         net: 'TestNet',
//         assetSymbols: ['NEO', "GAS"],
//         assets: {

//         }
//     })
// }

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