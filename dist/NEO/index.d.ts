import { wallet } from '@cityofzion/neon-core';
import Coin from "../Common/coin";
export interface txData {
    tokenName: string;
    to: string;
    amount: number;
    memo?: string;
    balance: wallet.Balance;
}
export default class NEO extends Coin {
    generateAddress(publicKey: string): string;
    generateUnsignedContractTx(txData: txData): string;
    generateUnsignedClaimTx(claims: wallet.Claims): string;
}
