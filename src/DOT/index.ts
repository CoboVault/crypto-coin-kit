import {checkAddress, encodeAddress, blake2AsHex} from '@polkadot/util-crypto';
import u8aToHex from '@polkadot/util/u8a/toHex';
import hexToU8a from '@polkadot/util/hex/toU8a';
import u8aConcat from '@polkadot/util/u8a/concat';
import {TypeRegistry} from '@polkadot/types/create/registry';
import {getSpecTypes} from '@polkadot/types-known';
import {Coin, GenerateTransactionResult} from '../Common/coin';
import {KeyProvider, KeyProviderSync} from '../Common/sign';
import Decorated from '@polkadot/metadata/Decorated';
import GenericExtrinsic from '@polkadot/types/extrinsic/Extrinsic';
import GenericExtrinsicPayload from '@polkadot/types/extrinsic/ExtrinsicPayload';
import BN from 'bn.js';
import blake2AsU8a from '@polkadot/util-crypto/blake2/asU8a';

export interface ChainProperties {
  ss58Format: number;
  tokenDecimals: number;
  tokenSymbol: string;
}

const defaultChainProperties: Record<string, ChainProperties> = {
  Kusama: {
    ss58Format: 2,
    tokenDecimals: 12,
    tokenSymbol: 'KSM',
  },
  Polkadot: {
    ss58Format: 0,
    tokenDecimals: 12,
    tokenSymbol: 'DOT',
  },
  'Polkadot CC1': {
    ss58Format: 0,
    tokenDecimals: 12,
    tokenSymbol: 'DOT',
  },
  Westend: {
    ss58Format: 42,
    tokenDecimals: 12,
    tokenSymbol: 'WND',
  },
};

export interface TxData {
  value: number | string;
  dest: string;
  blockHash: string;
  eraPeriod?: number;
  genesisHash: string;
  nonce: number;
  tip?: number;
  transactionVersion: number;
  specVersion: number;
  validityPeriod?: number;
  implVersion: number;
  authoringVersion: number;
  metaData: string;
}

enum SS58Prefix {
  POLKADOT = 0,
  KUSAMA = 2,
  WESTEND = 42,
}

const SIG_TYPE_NONE = new Uint8Array();
const SIG_TYPE_ED25519 = new Uint8Array([0]);
const SIG_TYPE_SR25519 = new Uint8Array([1]);
const SIG_TYPE_ECDSA = new Uint8Array([2]);

const chainCodes = {
  POLKADOT: Buffer.from(
    '20706f6c6b61646f740000000000000000000000000000000000000000000000',
    'hex',
  ),
  KUSAMA: Buffer.from(
    '186b7573616d6100000000000000000000000000000000000000000000000000',
    'hex',
  ),
  WESTEND: Buffer.from(
    '1c77657374656e64000000000000000000000000000000000000000000000000',
    'hex',
  ),
};

type Chain = {
  prefix: SS58Prefix;
  chainCode: Buffer;
  chainName: 'Polkadot' | 'Kusama' | 'Westend' | 'Polkadot CC1';
  specName: 'kusama' | 'polkadot' | 'westend';
  implName: 'parity-kusama' | 'parity-polkadot' | 'parity-westend';
};

const chains: {
  [k: string]: Chain;
} = {
  Polkadot: {
    prefix: SS58Prefix.POLKADOT,
    chainCode: chainCodes.POLKADOT,
    chainName: 'Polkadot',
    implName: 'parity-polkadot',
    specName: 'polkadot',
  },
  Kusama: {
    prefix: SS58Prefix.KUSAMA,
    chainCode: chainCodes.KUSAMA,
    chainName: 'Kusama',
    specName: 'kusama',
    implName: 'parity-kusama',
  },
  Westend: {
    prefix: SS58Prefix.WESTEND,
    chainCode: chainCodes.WESTEND,
    chainName: 'Westend',
    specName: 'westend',
    implName: 'parity-westend',
  },
};

export class DOT implements Coin {
  public static CHAINS = chains;
  public chain: Chain;

  constructor(chain?: string) {
    if (!chain) {
      this.chain = DOT.CHAINS.Polkadot;
    } else {
      this.chain = DOT.CHAINS[chain] || DOT.CHAINS.Polkadot;
    }
  }

  public generateTransactionSync = (
    data: TxData,
    signer: KeyProviderSync,
    type: 'ed25519' | 'sr25519' = 'sr25519',
  ) => {
    const registry = new TypeRegistry();
    // Register types specific to chain/runtimeVersion
    registry.register(
      // @ts-ignore
      getSpecTypes(
        // @ts-ignore
        registry,
        this.chain.chainName,
        this.chain.specName,
        data.specVersion,
      ),
    );
    // Register the chain properties for this registry
    registry.setChainProperties(
      registry.createType(
        'ChainProperties',
        defaultChainProperties[this.chain.chainName],
      ),
    );
    // @ts-ignore
    const decorated = new Decorated(registry, data.metaData);
    const tx = new GenericExtrinsic(
      registry,
      // @ts-ignore
      decorated.tx.balances.transfer(data.dest, data.value),
      {version: 4},
    );
    const signed = tx.sign(
      {
        address: this.generateAddress(signer.publicKey),
        publicKey: hexToU8a(signer.publicKey),
        sign: (data, options?) => {
          const {r, s} = signer.sign(u8aToHex(data));
          const sigtype =
            type === 'ed25519' ? SIG_TYPE_ED25519 : SIG_TYPE_SR25519;
          return u8aConcat(sigtype, hexToU8a('0x' + r + s));
        },
      },
      {
        blockHash: data.blockHash,
        genesisHash: data.genesisHash,
        nonce: data.nonce,
        runtimeVersion: {
          apis: [],
          authoringVersion: new BN(data.authoringVersion),
          implName: this.chain.implName,
          implVersion: new BN(data.implVersion),
          specName: this.chain.specName,
          specVersion: new BN(data.specVersion),
          transactionVersion: new BN(data.transactionVersion),
        },
      },
    );
    const signedTx = signed.toHex();
    const txHash = blake2AsHex(signedTx, 256);
    return {
      txId: txHash,
      txHex: signedTx,
    };
  };

  public generateAddress = (publicKey: string) => {
    if (publicKey.startsWith('0x')) {
      return encodeAddress(publicKey, this.chain.prefix);
    } else {
      return encodeAddress('0x' + publicKey, this.chain.prefix);
    }
  };

  public isAddressValid = (address: string) => {
    const [isValid, err] = checkAddress(address, this.chain.prefix);
    return isValid;
  };

  public generateTransaction = async (
    data: TxData,
    signer: KeyProvider,
    type: 'ed25519' | 'sr25519' = 'sr25519',
  ): Promise<GenerateTransactionResult> => {
    const registry = new TypeRegistry();
    // Register types specific to chain/runtimeVersion
    registry.register(
      // @ts-ignore
      getSpecTypes(
        // @ts-ignore
        registry,
        this.chain.chainName,
        this.chain.specName,
        data.specVersion,
      ),
    );
    // Register the chain properties for this registry
    registry.setChainProperties(
      registry.createType(
        'ChainProperties',
        defaultChainProperties[this.chain.chainName],
      ),
    );
    // @ts-ignore
    const decorated = new Decorated(registry, data.metaData);
    const extrinsic = new GenericExtrinsic(
      registry,
      // @ts-ignore
      decorated.tx.balances.transfer(data.dest, data.value),
      {version: 4},
    );
    const payload = new GenericExtrinsicPayload(
      registry,
      {
        blockHash: data.blockHash,
        era: new Uint8Array([0]),
        genesisHash: data.genesisHash,
        method: extrinsic.method.toHex(),
        nonce: data.nonce,
        specVersion: data.specVersion,
        tip: data.tip || 0,
        transactionVersion: data.transactionVersion || 0,
      },
      {version: 4},
    );
    const address = this.generateAddress(signer.publicKey);
    const u8a = payload.toU8a({method: true});
    const encoded = u8a.length > 256 ? blake2AsU8a(u8a) : u8a;
    const {r, s} = await signer.sign(u8aToHex(encoded));
    const sigtype = type === 'ed25519' ? SIG_TYPE_ED25519 : SIG_TYPE_SR25519;
    const signature = u8aConcat(sigtype, hexToU8a('0x' + r + s));
    extrinsic.addSignature(address, signature, {
      blockHash: payload.blockHash,
      era: payload.era,
      genesisHash: payload.genesisHash,
      method: payload.method,
      nonce: payload.nonce.toBn(),
      specVersion: payload.specVersion,
      tip: payload.tip.toBn(),
      transactionVersion: payload.transactionVersion,
    });
    const signedTx = extrinsic.toHex();
    const txHash = blake2AsHex(signedTx, 256);
    return {
      txId: txHash,
      txHex: signedTx,
    };
  };

  async signMessage(
    message: string,
    signProvider: KeyProvider,
  ): Promise<string> {
    const {r, s} = await signProvider.sign(
      Buffer.from(message, 'utf8').toString('hex'),
    );
    return `${r}${s}`;
  }

  signMessageSync(message: string, signProvider: KeyProviderSync): string {
    const {r, s} = signProvider.sign(
      Buffer.from(message, 'utf8').toString('hex'),
    );
    return `${r}${s}`;
  }
}
