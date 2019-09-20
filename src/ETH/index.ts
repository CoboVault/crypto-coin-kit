import { Buffer } from 'buffer';
import { Transaction } from 'ethereumjs-tx';
import {
    addHexPrefix,
    hashPersonalMessage,
    isValidAddress,
    pubToAddress,
    toBuffer,
    toChecksumAddress,
} from 'ethereumjs-util';

import { Coin, GenerateTransactionResult } from "../Common/coin";
import { Result, SignProvider, SignProviderSync } from '../Common/sign';

export interface TxData {
    nonce: string,
    gasPrice: string,
    gasLimit: string,
    to: string,
    value: string,
    data: string,
    chainId: number
}

export class ETH implements Coin {

    public chainId: number;
    constructor(chainId: number) {
        this.chainId = chainId || 1;
    }

    public generateTransactionSync = (data: TxData, signer: SignProviderSync) => {
        const tx = new Transaction(data);
        const hash = tx.hash(false);
        const sig = signer.sign(hash.toString('hex'));
        return this.buildSignedTx(data, sig);
    };

    public generateTransaction = async (data: TxData, signer: SignProvider) => {
        const tx = new Transaction(data);
        const hash = tx.hash(false);
        const sig = await signer.sign(hash.toString('hex'));
        return this.buildSignedTx(data, sig);
    };

    public signMessageSync = (message: string, signer: SignProviderSync) => {
        const hash = hashPersonalMessage(Buffer.from(message, 'utf8'));
        const sig = signer.sign(hash.toString('hex'));
        return this.buildSignedMessage(sig);
    };

    public signMessage = async (message: string, signer: SignProvider) => {
        const hash = hashPersonalMessage(Buffer.from(message, 'utf8'));
        const sig = await signer.sign(hash.toString('hex'));
        return this.buildSignedMessage(sig)
    };

    public generateAddress = (publicKey: string) => {
        const address = pubToAddress(toBuffer(publicKey), true).toString('hex');
        return toChecksumAddress(address);
    };

    public isAddressValid = (address: string, checkSum?:boolean) => {
        if (checkSum) {
            return isValidAddress(address) && toChecksumAddress(address) === address;
        }
        return isValidAddress(address);
    };

    private buildSignedTx = (data: TxData, sigResult: Result): GenerateTransactionResult => {
        const r = Buffer.from(sigResult.r, 'hex');
        const s = Buffer.from(sigResult.s, 'hex');
        let v = 27 + sigResult.recId;
        if (this.chainId > 0) {
            v += this.chainId * 2 + 8
        }
        const sig = {r, s, v};
        const signedTx = new Transaction(data);
        Object.assign(signedTx, sig);
        return {
            txId: addHexPrefix(signedTx.hash().toString('hex')),
            txHex: addHexPrefix(signedTx.serialize().toString('hex')),
        };
    };

    private buildSignedMessage = (sigResult: Result): string => {
        const r = sigResult.r;
        const s = sigResult.s;
        const recIdStr = Buffer.of(sigResult.recId).toString('hex');
        return addHexPrefix(r.concat(s).concat(recIdStr));
    }

}