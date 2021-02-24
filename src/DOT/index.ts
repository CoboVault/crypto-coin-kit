import {checkAddress, encodeAddress, blake2AsHex} from '@polkadot/util-crypto';
import {hexToU8a, u8aToHex, u8aConcat} from '@polkadot/util';
import {TypeRegistry} from '@polkadot/types/create/registry';
import {getSpecTypes} from '@polkadot/types-known';
import {Coin, GenerateTransactionResult} from '../Common/coin';
import {KeyProvider, KeyProviderSync} from '../Common/sign';
import {expandMetadata} from '@polkadot/metadata/decorate';
import {Metadata} from '@polkadot/metadata';
import {
  GenericExtrinsic,
  GenericExtrinsicPayload,
} from '@polkadot/types/extrinsic';
import BN from 'bn.js';
import {blake2AsU8a} from '@polkadot/util-crypto/blake2';
import {westend, polkadot, kusama} from './metas';

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
    tokenDecimals: 10,
    tokenSymbol: 'DOT',
  },
  'Polkadot CC1': {
    ss58Format: 0,
    tokenDecimals: 10,
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
  blockNumber: number;
  eraPeriod?: number;
  nonce: number;
  tip?: number;
  transactionVersion: number;
  specVersion: number;
  validityPeriod?: number;
  implVersion: number;
  authoringVersion: number;
  metaData?: string;
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
  metaData: string;
  genesisHash: string;
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
    metaData: polkadot,
    genesisHash:
      '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  },
  Kusama: {
    prefix: SS58Prefix.KUSAMA,
    chainCode: chainCodes.KUSAMA,
    chainName: 'Kusama',
    specName: 'kusama',
    implName: 'parity-kusama',
    metaData: kusama,
    genesisHash:
      '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
  },
  Westend: {
    prefix: SS58Prefix.WESTEND,
    chainCode: chainCodes.WESTEND,
    chainName: 'Westend',
    specName: 'westend',
    implName: 'parity-westend',
    metaData: westend,
    genesisHash:
      '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
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
      getSpecTypes(
        registry,
        this.chain.chainName,
        this.chain.specName,
        data.specVersion,
      ),
    );
    registry.setChainProperties(
      registry.createType(
        'ChainProperties',
        defaultChainProperties[this.chain.chainName],
      ),
    );
    registry.setMetadata(
      new Metadata(registry, data.metaData || this.chain.metaData),
    );
    const decorated = expandMetadata(
      registry,
      new Metadata(registry, data.metaData || this.chain.metaData),
    );
    const tx = new GenericExtrinsic(
      registry,
      decorated.tx.balances.transferKeepAlive(data.dest, data.value),
      {version: 4},
    );
    const era = data.eraPeriod
      ? registry.createType('ExtrinsicEra', {
          current: data.blockNumber,
          period: data.eraPeriod,
        })
      : undefined;
    const publicKeyHex = signer.publicKey.startsWith('0x')
      ? signer.publicKey
      : '0x' + signer.publicKey;
    const signed = tx.sign(
      {
        address: this.generateAddress(publicKeyHex),
        addressRaw: hexToU8a(publicKeyHex),
        publicKey: hexToU8a(publicKeyHex),
        sign: (data, options?) => {
          const {r, s} = signer.sign(u8aToHex(data));
          const sigtype =
            type === 'ed25519' ? SIG_TYPE_ED25519 : SIG_TYPE_SR25519;
          return u8aConcat(sigtype, hexToU8a('0x' + r + s));
        },
      },
      {
        blockHash: data.blockHash,
        genesisHash: this.chain.genesisHash,
        nonce: data.nonce,
        era,
        runtimeVersion: {
          apis: [],
          authoringVersion: new BN(data.authoringVersion),
          implName: this.chain.implName,
          implVersion: new BN(data.implVersion),
          specName: this.chain.specName,
          specVersion: new BN(data.specVersion),
          transactionVersion: new BN(data.transactionVersion),
        },
        tip: data.tip || 0,
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
    const decorated = expandMetadata(
        registry,
        new Metadata(registry, data.metaData || this.chain.metaData),
    );
    const extrinsic = new GenericExtrinsic(
      registry,
      // @ts-ignore
      decorated.tx.balances.transferKeepAlive(data.dest, data.value),
      {version: 4},
    );
    const payload = new GenericExtrinsicPayload(
      registry,
      {
        blockHash: data.blockHash,
        era: new Uint8Array([0]),
        genesisHash: this.chain.genesisHash,
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
