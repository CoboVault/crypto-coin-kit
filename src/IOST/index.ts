import { Buffer } from 'buffer';
// @ts-ignore
import {Bs58, IOST as Iost, Signature, Tx} from 'iost';
import sha3 from "js-sha3";
import {Coin} from "../Common/coin";
import {KeyProvider, KeyProviderSync, Result, SignProvider, SignProviderSync} from "../Common/sign";


export interface TxData {
    tokenName?: string,
    from: string,
    to: string,
    amount: string,
    memo: string,
    timestamp: number, // milliseconds
    expiration?: number, // seconds
    config?: Config
}

export interface Config {
    gasRatio: number,
    gasLimit: number,
    delay: number,
    defaultLimit: string,
}

export class IOST implements Coin {
    private defaultConfig = {
        gasRatio: 1,
        gasLimit: 1000000,
        delay: 0,
        defaultLimit: 'unlimited',
    };

    public generateAddress = (publicKey: string) => {
        return Bs58.encode(Buffer.from(publicKey, 'hex'));
    };

    public isAddressValid = (bs58PubKey: string) => {
        try {
            Bs58.decode(bs58PubKey);
            return true;
        } catch (e) {
            return false;
        }
    };

    public generateTransaction = async (txData: TxData, signer: KeyProvider) => {
        const {tx, hash} = this.unsignedTx(txData);
        const hashHex = Buffer.from(hash).toString('hex')
        const sig = await signer.sign(hashHex);
        tx.publisher_sigs.push(this.generateSignature(sig, Buffer.from(signer.publicKey, 'hex')));
        return this.generateOutput(tx);
    };

    public generateTransactionSync = (txData: TxData, signer: KeyProviderSync) => {
        const {tx, hash} = this.unsignedTx(txData);
        const hashHex = Buffer.from(hash).toString('hex')
        const sig = signer.sign(hashHex);
        tx.publisher_sigs.push(this.generateSignature(sig, Buffer.from(signer.publicKey, 'hex')));
        return this.generateOutput(tx);
    };

    public signMessage = async (message: string, signer: SignProvider) => {
        const sig = await signer.sign(this.hash(Buffer.from(message, "utf8")));
        return `${sig.r}${sig.s}`
    };

    public signMessageSync = (message: string, signer: SignProviderSync) => {
        const sig = signer.sign(this.hash(Buffer.from(message, "utf8")));
        return `${sig.r}${sig.s}`
    };

    private unsignedTx(txData: TxData) {
        const {tokenName = 'iost', from, to, amount, memo, config = this.defaultConfig} = txData;
        const iostInstance = new Iost(config);
        const tx = iostInstance.transfer(tokenName, from, to, amount, memo);
        tx.amount_limit = [{token: 'iost', value: '1'}];
        tx.publisher = from;
        tx.time = txData.timestamp * 1e6;
        tx.expiration = tx.time + (txData.expiration || 300) * 1e9;
        tx.delay = 0;
        const hash = tx._publish_hash();
        return {tx, hash};
    }

    private generateOutput = (tx: Tx) => ({
        txHex: JSON.stringify(tx),
        txId: tx.getSignedTxHash(),
    });

    private generateSignature = (res: Result, pubkey: Buffer) => {
        return Object.assign(new Signature, {
            algorithm: 2,
            pubkey,
            sig: Buffer.concat([Buffer.from(res.r, 'hex'), Buffer.from(res.s, 'hex')])
        });
    };

    private hash = (buf: Buffer) => {
        return sha3.keccak_256(buf).toString();
    }
}
