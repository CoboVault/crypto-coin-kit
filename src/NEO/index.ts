import { tx, wallet } from "@cityofzion/neon-core";
import { SignProvider, SignProviderSync } from "../Common";
import { Coin } from '../Common/coin'
import {
  buildNeoBalance,
  buildNeoClaims,
  SignProviderWithPrivateKey
} from "./utils";

export interface TxData {
  tokenName: string;
  to: string;
  amount: number;
  memo?: string;
  balance: wallet.Balance;
}
export default class NEO implements Coin {
  public static utils = {
    SignProviderWithPrivateKey,
    buildNeoBalance,
    buildNeoClaims
  };
  public network:string;

  constructor(network?:string){
    this.network = network || 'MainNet'
  }

  public generateAddress = (publicKey: string)  => {
    const account = new wallet.Account(publicKey);
    return account.address;
  }

  public isAddressValid = (address: string): boolean => {    
    return wallet.isAddress(address)
  }

  public generateTransaction = async (txData:TxData, signProvider: SignProvider, options: {signerPubkey: string}) => {
    const coinTx = this.composeUnsignedTx(txData)
    const unsignedTxHex = coinTx.serialize(false)
    const {r, s} = await signProvider.sign(unsignedTxHex)
    const signature = `${r}${s}`
    console.log('----', signature)
    const {txHex, txId} = this.composeSignedObject(signature, options.signerPubkey, coinTx)
    return {
      txHex,
      txId
    }
  }

  public generateTransactionSync = (txData:TxData, signProvider: SignProviderSync, options: {signerPubkey: string}) => {
    const coinTx = this.composeUnsignedTx(txData)
    const unsignedTxHex = coinTx.serialize(false)
    const {r, s} = signProvider.sign(unsignedTxHex)
    const signature = `${r}${s}`
    const {txHex, txId} = this.composeSignedObject(signature, options.signerPubkey, coinTx)
    return {
      txHex,
      txId
    }
  }


  public signMessage = async (hex: string, signer: SignProvider)  => {
    const result = await signer.sign(hex)
    return result
  }

  public signMessageSync = (hex: string , signer: SignProviderSync) => {
    const result = signer.sign(hex)
    return result
  }

  private composeUnsignedTx = (txData: TxData) => {
    const coinTx = new tx.ContractTransaction().addIntent(
      txData.tokenName,
      txData.amount,
      txData.to
    );

    if (txData.memo) {
      coinTx.addRemark(txData.memo);
    }

    coinTx.calculate(txData.balance);
    return coinTx
  }

  private composeSignedObject = (signature: string, signerPubKey: string, transaction: tx.BaseTransaction) => {
    transaction.addWitness(tx.Witness.fromSignature(signature, signerPubKey))
    return {
      txHex: transaction.serialize(),
      txId: transaction.hash
    }
  }
}
