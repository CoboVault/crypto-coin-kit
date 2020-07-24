// @ts-ignore
import blake2b from 'bcrypto/lib/blake2b';
import * as bitcoin from 'bitcoinjs-lib';
// @ts-ignore
import hsd from 'hsd';
import {TxData} from '../BTC_FORK';
import {GenerateTransactionResult, UtxoCoin} from '../Common/coin';
import {KeyProvider, KeyProviderSync} from '../Common/sign';

const MAGIC_STRING = 'handshake signed message:\n';

export class HNS implements UtxoCoin {
  public async signMessage(
    message: string,
    signer: KeyProvider,
  ): Promise<string> {
    const msg = Buffer.from(MAGIC_STRING + message, 'utf8');
    const hash = blake2b.digest(msg);
    const {r, s} = await signer.sign(hash.toString('hex'));
    const sig = Buffer.from(r + s, 'hex');
    return sig.toString('base64');
  }
  public signMessageSync(message: string, signer: KeyProviderSync): string {
    const msg = Buffer.from(MAGIC_STRING + message, 'utf8');
    const hash = blake2b.digest(msg);
    const {r, s} = signer.sign(hash.toString('hex'));
    const sig = Buffer.from(r + s, 'hex');
    return sig.toString('base64');
  }
  public generateAddress(publicKey: string, network = 'main'): string {
    return hsd.Address.fromPubkey(Buffer.from(publicKey, 'hex')).toString(
      network,
    );
  }

  public async generateTransaction(
    txData: TxData,
    signers: KeyProvider[],
  ): Promise<GenerateTransactionResult> {
    const signer = signers[0];
    const mtx = new hsd.MTX();
    txData.inputs.forEach(each => {
      mtx.addCoin(
        new hsd.Coin({
          version: 0,
          value: each.value,
          address: 'rs1qtc022nmph8lql7k4cr8jtk0ezyk68hu65h2l8t',
          hash: Buffer.from(each.hash, 'hex'),
          index: 0,
        }),
      );
    });
    txData.outputs.forEach(each => {
      mtx.addOutput({
        value: each.value,
        address: each.address,
      });
    });
    let i = 0;
    for (const each of mtx.inputs) {
      const input = txData.inputs[i];
      const pubkey = input.pubkey;
      this.scriptInput(each, pubkey);
      const hashType = hsd.Script.hashType.ALL;
      const addr = this.generateAddress(pubkey);
      const {data} = bitcoin.address.fromBech32(addr);
      const pkh = hsd.Script.fromPubkeyhash(data);
      const hash = mtx.signatureHash(i, pkh, input.value, hashType);
      const {r, s} = await signer.sign(hash.toString('hex'));
      const signature = Buffer.alloc(65);
      signature.write(r + s, 'hex');
      signature.writeUInt8(hashType, 64);
      const stack = each.witness.toStack();
      stack.set(0, signature);
      each.witness.fromStack(stack);
      i++;
    }
    const tx = mtx.toTX();
    return {
      txId: tx.txid(),
      txHex: tx.encode().toString('hex'),
    };
  }

  public generateTransactionSync(
    txData: TxData,
    signers: KeyProviderSync[],
  ): GenerateTransactionResult {
    const signer = signers[0];
    const mtx = new hsd.MTX();
    txData.inputs.forEach(each => {
      mtx.addCoin(
        new hsd.Coin({
          version: 0,
          value: each.value,
          address: 'rs1qtc022nmph8lql7k4cr8jtk0ezyk68hu65h2l8t',
          hash: Buffer.from(each.hash, 'hex'),
          index: 0,
        }),
      );
    });
    txData.outputs.forEach(each => {
      mtx.addOutput({
        value: each.value,
        address: each.address,
      });
    });
    let i = 0;
    for (const each of mtx.inputs) {
      const input = txData.inputs[i];
      const pubkey = input.pubkey;
      this.scriptInput(each, pubkey);
      const hashType = hsd.Script.hashType.ALL;
      const addr = this.generateAddress(pubkey);
      const {data} = bitcoin.address.fromBech32(addr);
      const pkh = hsd.Script.fromPubkeyhash(data);
      const hash = mtx.signatureHash(i, pkh, input.value, hashType);
      const {r, s} = signer.sign(hash.toString('hex'));
      const signature = Buffer.alloc(65);
      signature.write(r + s, 'hex');
      signature.writeUInt8(hashType, 64);
      const stack = each.witness.toStack();
      stack.set(0, signature);
      each.witness.fromStack(stack);
      i++;
    }
    const tx = mtx.toTX();
    return {
      txId: tx.txid(),
      txHex: tx.encode().toString('hex'),
    };
  }

  public isAddressValid(address: string): boolean {
    return false;
  }

  private scriptInput(input: hsd.Input, publicKey: string) {
    if (input.witness.items.length !== 0) {
      return;
    }
    const stack = new hsd.Stack();
    stack.pushInt(0);
    stack.pushData(Buffer.from(publicKey, 'hex'));
    input.witness.fromStack(stack);
  }
}
