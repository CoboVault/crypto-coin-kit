import * as bitcoin from 'bitcoinjs-lib'
// @ts-ignore
import bs58check from 'bs58check'
import { Buffer as SafeBuffer } from 'safe-buffer'
import { SignProvider, SignProviderSync } from "../Common";


type AddressType = 'P2PKH' | 'P2SH' | 'P2WPKH'

type netWorkType = 'mainNet' | 'testNet'

interface TxOutputItem {
    address: 'string',
    value: number
}


interface TxInputItem {
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




interface TxData {
    inputs: TxInputItem[]
    outputs?: TxOutputItem[]
    to?: string
    amount?: number // sta unit
    fee?: number
    changeAddres?: string
}

interface KeyProvider extends SignProvider {
    publicKey: string
}


const MAX_FEE = 1000000

export default class BTC {

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
        const psbt = new bitcoin.Psbt({ network: this.network })
        if (this.verifyInput(txData)) {
            txData.inputs.forEach(eachInput => {
                if (eachInput.witnessUtxo) {
                    return psbt.addInput({
                        hash: eachInput.hash,
                        index: eachInput.index,
                        witnessUtxo: {
                            script: Buffer.from(eachInput.witnessUtxo.script, 'hex'),
                            value: eachInput.witnessUtxo.value
                        },
                        redeemScript: bitcoin.payments.p2wpkh({
                            pubkey: Buffer.from(eachInput.witnessUtxo.publicKey, 'hex'),
                            network: this.network
                        }).output
                    })
                }
                if (eachInput.nonWitnessUtxo) {
                    return psbt.addInput({
                        hash: eachInput.hash,
                        index: eachInput.index,
                        nonWitnessUtxo: Buffer.from(eachInput.nonWitnessUtxo, 'hex')
                    })
                }
                throw new Error('choose right utxo type')
            });
        }

        if (txData.outputs) {
            psbt.addOutputs(txData.outputs)
        } else if (txData.amount && txData.to && txData.changeAddres && txData.fee) {
            psbt.addOutput({
                address: txData.to,
                value: txData.amount
            })
            const totalInputs = txData.inputs.reduce((acc: number, cur: TxInputItem) => acc + cur.value, 0)
            const changeAmount = totalInputs - txData.amount - txData.fee
            psbt.addOutput({
                address: txData.changeAddres,
                value: changeAmount
            })
        }

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
        psbt.finalizeAllInputs();
        const txHex = psbt.extractTransaction().toHex()
        const txId = psbt.extractTransaction().getId()
        return {
            txId,
            txHex
        }
    }

    private verifyInput = (txData: TxData, disableLargeFee: boolean = true) => {
        const totalInputs = txData.inputs.reduce((acc: number, cur: TxInputItem) => acc + cur.value, 0)
        if (txData.outputs) {
            const totalOuputs = txData.outputs.reduce((acc: number, cur: TxOutputItem) => acc + cur.value, 0)
            const fee = totalInputs - totalOuputs
            if (fee >= 0 && (disableLargeFee ? fee < MAX_FEE : true)) {
                return true
            }
        } else if (txData.fee && txData.amount) {
            console.log(totalInputs)
            if (totalInputs >= txData.fee + txData.amount) {
                return true
            }
        }
        return false

    }
}

