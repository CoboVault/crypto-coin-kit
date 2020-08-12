import {checkAddress, encodeAddress, blake2AsHex} from '@polkadot/util-crypto';
import {u8aToHex} from '@polkadot/util';
import {TypeRegistry} from '@polkadot/types';
import {getSpecTypes} from '@polkadot/types-known';
import {Coin, GenerateTransactionResult} from '../Common/coin';
import {KeyProvider, KeyProviderSync} from '../Common/sign';
import {hexToU8a, u8aConcat} from '@polkadot/util/index';
import {kusama, westend, polkadot} from './metas';
import Decorated from '@polkadot/metadata/Decorated';
import {GenericExtrinsic} from '@polkadot/types/extrinsic';
import BN from 'bn.js';

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
  metadata: string;
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
    metadata: polkadot,
  },
  Kusama: {
    prefix: SS58Prefix.KUSAMA,
    chainCode: chainCodes.KUSAMA,
    chainName: 'Kusama',
    specName: 'kusama',
    metadata: kusama,
    implName: 'parity-kusama',
  },
  Westend: {
    prefix: SS58Prefix.WESTEND,
    chainCode: chainCodes.WESTEND,
    chainName: 'Westend',
    specName: 'westend',
    metadata: westend,
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

  public generateTransactionSync = (data: TxData, signer: KeyProviderSync) => {
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
    const decorated = new Decorated(registry, this.chain.metadata);
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
          return u8aConcat(SIG_TYPE_SR25519, hexToU8a('0x' + r + s));
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

  generateTransaction(
    txData: any,
    keyProvider: KeyProvider,
    options: any,
  ): Promise<GenerateTransactionResult> {
    throw new Error('not implemented');
  }

  signMessage(message: string, signProvider: KeyProvider): Promise<string> {
    throw new Error('not implemented');
  }

  signMessageSync(message: string, signProvider: KeyProviderSync): string {
    throw new Error('not implemented');
  }
}
