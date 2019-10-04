import * as bitcoin from 'bitcoinjs-lib'
import { TxData, TxInputItem, TxOutputItem } from './index' 

const MAX_FEE = 1000000

export default class PsbtBuilder {
    private psbt: bitcoin.Psbt
    private network: bitcoin.Network
    constructor(network: bitcoin.Network){
        this.network = network
        this.psbt = new bitcoin.Psbt({ network })
    }

    public addInputsForPsbt = (txData: TxData) => {
        if (this.verifyInput(txData)) {
            txData.inputs.forEach(eachInput => {
                if (eachInput.witnessUtxo) {
                    return this.psbt.addInput({
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
                    return this.psbt.addInput({
                        hash: eachInput.hash,
                        index: eachInput.index,
                        nonWitnessUtxo: Buffer.from(eachInput.nonWitnessUtxo, 'hex')
                    })
                }
                throw new Error('choose right utxo type')
            });
            return this
        }
        throw new Error('input value are invaild ')         
    }

    

    public addOutputForPsbt = (txData: TxData) => {
        if (txData.outputs) {
            this.psbt.addOutputs(txData.outputs)
        } else if (txData.amount && txData.to && txData.changeAddres && txData.fee) {
            this.psbt.addOutput({
                address: txData.to,
                value: txData.amount
            })
            const totalInputs = txData.inputs.reduce((acc: number, cur: TxInputItem) => acc + cur.value, 0)
            const changeAmount = totalInputs - txData.amount - txData.fee
            this.psbt.addOutput({
                address: txData.changeAddres,
                value: changeAmount
            })
        }
        return this
    }

    public getPsbt = () => {
        return this.psbt
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
            if (totalInputs >= txData.fee + txData.amount) {
                return true
            }
        }
        return false
    }

}