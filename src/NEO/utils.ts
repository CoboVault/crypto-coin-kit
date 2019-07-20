import { wallet, tx } from '@cityofzion/neon-core'
import { SignProvider } from '../Common';
import { identifier } from '@babel/types';

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