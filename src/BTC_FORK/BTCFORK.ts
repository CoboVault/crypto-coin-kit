import bchaddr from "bchaddrjs";
import { networks, Transaction} from "bitcoinjs-lib";
import {BTC, NetWorkType} from "../BTC";
import {KeyProvider, KeyProviderSync} from "../Common/sign";
import {Network, SIGHASH_FORKID} from "./index";
import {Psbt} from "./psbt";
import {TxData} from "./tx_data";


export abstract class BTCFORK extends BTC{
    protected network: Network;
    protected networkType: NetWorkType;
    protected constructor(networkType: NetWorkType = NetWorkType.mainNet) {
        super();
        this.networkType = networkType;
        this.network = this.initNetwork(networkType);
    }

    public initNetwork = (networkType: NetWorkType) => {
        if (networkType === NetWorkType.mainNet) {
            return  networks.bitcoin;
        } else {
            return  networks.regtest;
        }
    };
    // @ts-ignore
    public generateTransactionSync = (
        txData: TxData,
        signers: KeyProviderSync[]
    ) => {
        const psbt = new Psbt({network: this.network});
        this.addInputs(txData, psbt, signers);
        txData.outputs.forEach(output => psbt.addOutput(output));
        for (const signer of signers) {
            const keyPair = {
                publicKey: Buffer.from(signer.publicKey, "hex"),
                sign: (hashBuffer: Buffer) => {
                    const hexString = hashBuffer.toString("hex");
                    const {r, s} = signer.sign(hexString);
                    return Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")]);
                }
            };
            psbt.signAllInputs(keyPair, [this.getSighashType()]);
        }
        return this.buildTx(psbt)
    };

    // @ts-ignore
    public generateTransaction = async (
        txData: TxData,
        signers: KeyProvider[]
    ) => {
        const psbt = new Psbt({network: this.network});
        this.addInputs(txData, psbt, signers);
        txData.outputs.forEach(output => psbt.addOutput(output));
        for (const signer of signers) {
            const keyPair = {
                publicKey: Buffer.from(signer.publicKey, "hex"),
                sign: async (hashBuffer: Buffer) => {
                    const hexString = hashBuffer.toString("hex");
                    const {r, s} = await signer.sign(hexString);
                    return Buffer.concat([Buffer.from(r, "hex"), Buffer.from(s, "hex")]);
                }
            };
            await psbt.signAllInputsAsync(keyPair, [this.getSighashType()]);
        }
        return this.buildTx(psbt)
    };

    public isAddressValid = (address: string) => {
        return bchaddr.isValidAddress(address);
    };

    private addInputs(txData: TxData, psbt: Psbt, signers: KeyProvider[] | KeyProviderSync[]) {
        for (let i = 0; i < txData.inputs.length; i++) {
            psbt.addInput({
                hash: txData.inputs[i].hash,
                index: txData.inputs[i].index,
                value: txData.inputs[i].value,
                sighashType: this.getSighashType(),
                pubkey: Buffer.from(signers[i].publicKey, 'hex')
            })
        }
    }

    private getSighashType = () => {
        if (typeof this.network.forkId !== 'undefined') {
            return Transaction.SIGHASH_ALL | SIGHASH_FORKID;
        }

        return Transaction.SIGHASH_ALL;
    };

    private buildTx = (psbt: Psbt) => {
        if (psbt.validateSignaturesOfAllInputs()) {
            psbt.finalizeAllInputs();
            const txHex = psbt.extractTransaction().toHex();
            const txId = psbt.extractTransaction().getId();
            return {
                txId,
                txHex
            };
        }
        throw new Error("signature verification failed");
    };
}