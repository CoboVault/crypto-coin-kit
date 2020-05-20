import {networks, Transaction} from 'bitcoinjs-lib';
import {BTC, NetWorkType} from '../BTC';
import {KeyProvider, KeyProviderSync} from '../Common/sign';
import {HookPsbt} from './hookPsbt';
import {Network, SIGHASH_FORKID} from './index';
import {TxData} from './tx_data';

export abstract class BTCFORK extends BTC {
  protected network: Network;
  protected networkType: NetWorkType;
  protected constructor(networkType: NetWorkType = NetWorkType.mainNet) {
    super();
    this.networkType = networkType;
    this.network = this.initNetwork(networkType);
  }
  // @ts-ignore
  public generateTransactionSync = (
    txData: TxData,
    signers: KeyProviderSync[],
  ) => {
    const uniqueSigners = this.filterUniqueSigner(signers);
    const psbt = new HookPsbt({network: this.network});
    this.addInputs(txData, psbt, signers);
    txData.outputs.forEach(output => psbt.addOutput(output));
    for (const signer of uniqueSigners) {
      const keyPair = {
        publicKey: Buffer.from(signer.publicKey, 'hex'),
        sign: (hashBuffer: Buffer) => {
          const hexString = hashBuffer.toString('hex');
          const {r, s} = signer.sign(hexString);
          return Buffer.concat([Buffer.from(r, 'hex'), Buffer.from(s, 'hex')]);
        },
      };
      psbt.signAllInputs(keyPair, [this.getSighashType()]);
    }
    return this.buildTx(psbt);
  };

  // @ts-ignore
  public generateTransaction = async (
    txData: TxData,
    signers: KeyProvider[],
  ) => {
    const uniqueSigners = this.filterUniqueSigner(signers);
    const psbt = new HookPsbt({network: this.network});
    this.addInputs(txData, psbt, signers);
    txData.outputs.forEach(output => psbt.addOutput(output));
    for (const signer of uniqueSigners) {
      const keyPair = {
        publicKey: Buffer.from(signer.publicKey, 'hex'),
        sign: async (hashBuffer: Buffer) => {
          const hexString = hashBuffer.toString('hex');
          const {r, s} = await signer.sign(hexString);
          return Buffer.concat([Buffer.from(r, 'hex'), Buffer.from(s, 'hex')]);
        },
      };
      await psbt.signAllInputsAsync(keyPair, [this.getSighashType()]);
    }
    return this.buildTx(psbt);
  };

  public abstract isAddressValid(address: string): boolean;

  protected initNetwork = (networkType: NetWorkType) => {
    if (networkType === NetWorkType.mainNet) {
      return networks.bitcoin;
    } else {
      return networks.regtest;
    }
  };

  private addInputs(
    txData: TxData,
    psbt: HookPsbt,
    signers: KeyProvider[] | KeyProviderSync[],
  ) {
    for (const input of txData.inputs) {
      psbt.addInput({
        hash: input.hash,
        index: input.index,
        value: input.value,
        sighashType: this.getSighashType(),
        pubkey: Buffer.from(input.pubkey, 'hex'),
      });
    }
  }

  private getSighashType = () => {
    if (typeof this.network.forkId !== 'undefined') {
      return Transaction.SIGHASH_ALL | SIGHASH_FORKID;
    }

    return Transaction.SIGHASH_ALL;
  };

  private buildTx = (psbt: HookPsbt) => {
    if (psbt.validateSignaturesOfAllInputs()) {
      psbt.finalizeAllInputs();
      const txHex = psbt.extractTransaction().toHex();
      const txId = psbt.extractTransaction().getId();
      return {
        txId,
        txHex,
      };
    }
    throw new Error('signature verification failed');
  };
}
