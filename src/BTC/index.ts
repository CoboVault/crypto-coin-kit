import * as bitcoin from 'bitcoinjs-lib'
// @ts-ignore
import bs58check from 'bs58check'
import { Buffer as SafeBuffer } from 'safe-buffer'
import { UtxoCoin } from '../Common/coin'
import { KeyProvider, KeyProviderSync } from '../Common/sign'
import { hash256, numberToHex } from '../utils'
import PsbtBuilder from './txBuilder'


type AddressType = 'P2PKH' | 'P2SH' | 'P2WPKH'

type netWorkType = 'mainNet' | 'testNet'

export interface TxOutputItem {
    address: 'string',
    value: number
}


export interface TxInputItem {
    hash: string
    index: number
    nonWitnessUtxo?: string
    witnessUtxo?: {
        publicKey: string
        script: string
        value: number
    }
    value: number
}

export interface TxData {
    inputs: TxInputItem[]
    outputs?: TxOutputItem[]
    to?: string
    amount?: number // sta unit
    fee?: number
    changeAddres?: string
}

export default class BTC implements UtxoCoin {

    private network: bitcoin.Network
    constructor(networkType?: netWorkType) {
        if (networkType === 'mainNet') {
            this.network = bitcoin.networks.bitcoin
        } else {
            this.network = bitcoin.networks.regtest
        }
    }

    public generateAddress = (publicKey: string, addressType: AddressType = 'P2SH') => {
        let btcAddaress: string | undefined;
        const pubkeyBuffer = SafeBuffer.from(publicKey, 'hex') as unknown as Buffer
        if (addressType === 'P2SH') {
            const { address } = bitcoin.payments.p2pkh({ pubkey: pubkeyBuffer, network: this.network });
            btcAddaress = address
        }
        if (addressType === 'P2SH') {
            const { address } = bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wpkh({ pubkey: pubkeyBuffer, network: this.network }),
                network: this.network
            });
            btcAddaress = address
        }
        if (addressType === 'P2WPKH') {
            const { address } = bitcoin.payments.p2wpkh(({ pubkey: pubkeyBuffer, network: this.network }))
            btcAddaress = address
        }

        if (btcAddaress) {
            return btcAddaress
        } else {
            throw new Error('generate address failed')
        }
    }

    public isAddressValid = (address: string) => {
        if (address.startsWith('1') || address.startsWith('3') || address.startsWith('2') || address.startsWith('bc')) {
            try {
                bs58check.decode(address)
                return true
            } catch (e) {
                return false
            }

        } else {
            return false
        }
    }


    public generateTransaction = async (txData: TxData, signers: KeyProvider[]) => {
        const psbtBuilder = new PsbtBuilder(this.network)
        const psbt = psbtBuilder.addInputsForPsbt(txData).addOutputForPsbt(txData).getPsbt()
        for (const signer of signers) {
            const keyPair = {
                publicKey: Buffer.from(signer.publicKey, 'hex'),
                sign: async (hashBuffer: Buffer) => {
                    const hexString = hashBuffer.toString('hex')
                    const { r, s } = await signer.sign(hexString)
                    return Buffer.concat([Buffer.from(r, 'hex'), Buffer.from(s, 'hex')])
                }
            }
            await psbt.signAllInputsAsync(keyPair)
        }
        return this.extractTx(psbt)
    }

    public generateTransactionSync = (txData: TxData, signers: KeyProviderSync[]) => {
        const psbtBuilder = new PsbtBuilder(this.network)
        const psbt = psbtBuilder.addInputsForPsbt(txData).addOutputForPsbt(txData).getPsbt()
        for (const signer of signers) {
            const keyPair = {
                publicKey: Buffer.from(signer.publicKey, 'hex'),
                sign: (hashBuffer: Buffer) => {
                    const hexString = hashBuffer.toString('hex')
                    const { r, s } = signer.sign(hexString)
                    return Buffer.concat([Buffer.from(r, 'hex'), Buffer.from(s, 'hex')])
                }
            }
            psbt.signAllInputs(keyPair)
        }
        return this.extractTx(psbt)
    }

    public signMessage = async (message:string, signer: KeyProvider) => {
        const hashHex = this.constructMessageHash(message)
        const {r,s} = await signer.sign(hashHex)
        return `${r}${s}`
    }

    public signMessageSync = (message: string, singerSync: KeyProviderSync) => {
        const hashHex = this.constructMessageHash(message)
        const {r,s} = singerSync.sign(hashHex)
        return `${r}${s}`
    }

    private constructMessageHash = (message: string) => {
        const MAGIC_BYTES = Buffer.from(this.network.messagePrefix, "utf-8");
        const messageBuffer = Buffer.from(message, "utf-8");
        const messageLength = Buffer.from(numberToHex(messageBuffer.length), "hex");
        const buffer = Buffer.concat([MAGIC_BYTES, messageLength, messageBuffer]);
        const hashHex = hash256(buffer).toString("hex");
        return hashHex
    }

    private extractTx = (psbt: bitcoin.Psbt) => {
        psbt.finalizeAllInputs();
        const txHex = psbt.extractTransaction().toHex()
        const txId = psbt.extractTransaction().getId()
        return {
            txId,
            txHex
        }
    }
}

