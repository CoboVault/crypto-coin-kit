import {DOT} from '../../DOT';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {sr25519KeyProviderSync} from '../keyProviders/Sr25519KeyProvider';
import {schnorrkelDeriveHard} from '@polkadot/util-crypto/index';
import schnorrkelKeypairFromU8a from '@polkadot/util-crypto/schnorrkel/keypair/fromU8a';
import {bufferToU8a, u8aToHex} from '@polkadot/util/index';
import {westend} from './metas';
import {
  ed25519KeyProvider,
  ed25519KeyProviderSync,
} from '../keyProviders/Ed25519KeyProvider';
jest.setTimeout(20000);

describe('coins.DOT', () => {
  const dot = new DOT();
  const ksm = new DOT('Kusama');
  const wnd = new DOT('Westend');
  const publicKey =
    '0x8cba3d59242abc565c99a47c3afaf23668f2e1b1a76a38ab71868ae2dafca963';
  const privateKey =
    '0xa02742d6e6ee1bfb9979b427ed28a8bb782ffd5e4762f212917f3f8d3c89b85a9954e5f5e688b86342b16599c77df0d143cbbc7556334d436d7bdceb0a67e201';
  beforeEach(async () => {
    await cryptoWaitReady();
  });
  it('should generate correct address', () => {
    expect(dot.generateAddress(publicKey)).toBe(
      '14BX2fAup13B79jAJhHDfrkNitWBXV6Fc6dYKjrsNmb8Fo7F',
    );
    expect(ksm.generateAddress(publicKey)).toBe(
      'FkqYeFiaandRGY67m3GRfHE1rnmdrMHyyjoZ79UJUn6pgrh',
    );
    expect(wnd.generateAddress(publicKey)).toBe(
      '5FFDtKuqxDmhfcieM4EDXhvDsGWXqBY7Xbu4ASsWpgZc5VvL',
    );
  });
  it('should derive and generate new keypair', () => {
    const prikey = privateKey.slice(2);
    const pubkey = publicKey.slice(2);
    const keypair = schnorrkelKeypairFromU8a(
      bufferToU8a(Buffer.from(prikey + pubkey, 'hex')),
    );
    const polkadot = schnorrkelDeriveHard(
      keypair,
      bufferToU8a(DOT.CHAINS.Polkadot.chainCode),
    );
    const pubkey1 = u8aToHex(polkadot.publicKey);
    expect(dot.generateAddress(pubkey1)).toBe(
      '1vQAnWwUYeEnoF1yK51ZmHpaVRs6inHHEJhzJto3xgqe4pF',
    );
    const kusama = schnorrkelDeriveHard(
      keypair,
      bufferToU8a(DOT.CHAINS.Kusama.chainCode),
    );
    const pubkey2 = u8aToHex(kusama.publicKey);
    expect(ksm.generateAddress(pubkey2)).toBe(
      'G2D9efkGkPBPysbXvfA8XD5ecZoxyjhTDiNGhLMd7gkcGNA',
    );
    const westend = schnorrkelDeriveHard(
      keypair,
      bufferToU8a(DOT.CHAINS.Westend.chainCode),
    );
    const pubkey3 = u8aToHex(westend.publicKey);
    expect(wnd.generateAddress(pubkey3)).toBe(
      '5DUmuykcaNu6bVE9R7Ya25oPMw3GkYjYLM2P9b5L1FdoB7kf',
    );
  });

  it('should check address valid', () => {
    const validAddress = '14571ZshWgZ38mQachJeDLsKeG2wqKpJqiGNawXkPa8tGu3M';
    const invalidAddress = '14571ZshWgZ38mQachJeDLsKeG2wqKpJqiGNawXkPa8tGu3Q';
    expect(dot.isAddressValid(validAddress)).toBe(true);
    expect(dot.isAddressValid(invalidAddress)).toBe(false);
  });
  it('should generate transaction', () => {
    const keyProviderSync = sr25519KeyProviderSync(privateKey, publicKey);
    const txData = {
      value: 100000000000,
      dest: '5DUmuykcaNu6bVE9R7Ya25oPMw3GkYjYLM2P9b5L1FdoB7kf',
      // polkadot: 0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3
      // kusama: 0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe
      // westend: 0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e
      blockHash:
        '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
      genesisHash:
        '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
      tip: 0,
      nonce: 3,
      implVersion: 0,
      authoringVersion: 2,
      specVersion: 41,
      transactionVersion: 2,
      metaData: westend,
    };
    const result = wnd.generateTransactionSync(txData, keyProviderSync);
    const reg = new RegExp(
      '0x3502848cba3d59242abc565c99a47c3afaf23668f2e1b1a76a38ab71868ae2dafca96301([a-f0-9]+)000c0004003e97c7cee955a5f2ab3f9346ed85bf2c1b16fcc1afae3e40942bbab648a036040700e8764817',
    );
    expect(reg.test(result.txHex)).toBe(true);
  });
  it('should generate tx with ed25519 key sync', () => {
    const edPrivateKey =
      '0xe19ae328d40d0b40ae117413eb17a97df31ef967f19a44350435df5af55a2879e9a74f8d59086d4c6b6408020729bcfcb70e7d793c4deb00d7774c0890b9ea20';
    const edPublicKey =
      '0xe9a74f8d59086d4c6b6408020729bcfcb70e7d793c4deb00d7774c0890b9ea20';
    const keyProviderSync = ed25519KeyProviderSync(edPrivateKey, edPublicKey);
    const txData = {
      value: 100000000000,
      dest: '5DUmuykcaNu6bVE9R7Ya25oPMw3GkYjYLM2P9b5L1FdoB7kf',
      // polkadot: 0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3
      // kusama: 0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe
      // westend: 0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e
      blockHash:
        '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
      genesisHash:
        '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
      tip: 0,
      nonce: 3,
      implVersion: 0,
      authoringVersion: 2,
      specVersion: 41,
      transactionVersion: 2,
      metaData: westend,
    };
    const result = wnd.generateTransactionSync(
      txData,
      keyProviderSync,
      'ed25519',
    );
    expect(result.txHex).toBe(
      '0x350284e9a74f8d59086d4c6b6408020729bcfcb70e7d793c4deb00d7774c0890b9ea20002432b974f1b5ad4996782741bfd1c281d6d7eb6af037d779b5a70f8acd1fc79724b2588fc104bf5f1592a2ed5e8e129d749562408b142dc8665c3a748fa09906000c0004003e97c7cee955a5f2ab3f9346ed85bf2c1b16fcc1afae3e40942bbab648a036040700e8764817',
    );
  });
  it('should generate tx with ed25519 key', async () => {
    const edPrivateKey =
      '0xe19ae328d40d0b40ae117413eb17a97df31ef967f19a44350435df5af55a2879e9a74f8d59086d4c6b6408020729bcfcb70e7d793c4deb00d7774c0890b9ea20';
    const edPublicKey =
      '0xe9a74f8d59086d4c6b6408020729bcfcb70e7d793c4deb00d7774c0890b9ea20';
    const keyProvider = ed25519KeyProvider(edPrivateKey, edPublicKey);
    const txData = {
      value: 100000000000,
      dest: '5DUmuykcaNu6bVE9R7Ya25oPMw3GkYjYLM2P9b5L1FdoB7kf',
      // polkadot: 0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3
      // kusama: 0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe
      // westend: 0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e
      blockHash:
        '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
      genesisHash:
        '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
      tip: 0,
      nonce: 3,
      implVersion: 0,
      authoringVersion: 2,
      specVersion: 41,
      transactionVersion: 2,
      metaData: westend,
    };
    const result = await wnd.generateTransaction(
      txData,
      keyProvider,
      'ed25519',
    );
    expect(result.txHex).toBe(
      '0x350284e9a74f8d59086d4c6b6408020729bcfcb70e7d793c4deb00d7774c0890b9ea20002432b974f1b5ad4996782741bfd1c281d6d7eb6af037d779b5a70f8acd1fc79724b2588fc104bf5f1592a2ed5e8e129d749562408b142dc8665c3a748fa09906000c0004003e97c7cee955a5f2ab3f9346ed85bf2c1b16fcc1afae3e40942bbab648a036040700e8764817',
    );
  });
  // it('test api kusama', async () => {
  //   const wsProvider = new WsProvider('wss://rpc.polkadot.io/');
  //   const api = await ApiPromise.create({provider: wsProvider});
  //   const transfer = api.tx.balances.transfer(
  //     'EEWyMLHgwtemr48spFNnS3U2XjaYswqAYAbadx2jr9ppp4X',
  //     100000000000,
  //   );
  //   const keyring = new Keyring({type: 'ed25519'});
  //   const sr = createPair(
  //     {toSS58: keyring.encodeAddress, type: 'ed25519'},
  //     {publicKey: hexToU8a(edpub), secretKey: hexToU8a(edpri)},
  //     {},
  //   );
  //   const signed = transfer.sign(sr, {nonce: 1});
  //   console.log(signed.toHuman(true));
  //   console.log(signed.toHex());
  // });
  // it('test offline kusama', () => {
  //   const registry = getRegistry('Kusama', 'kusama', 2022);
  //   const decorated = new Decorated(registry, metadata);
  //   const tx = new GenericExtrinsic(
  //     registry,
  //     decorated.tx.balances.transfer(
  //       'EEWyMLHgwtemr48spFNnS3U2XjaYswqAYAbadx2jr9ppp4X',
  //       100000000000,
  //     ),
  //     {version: 4},
  //   );
  //   const keyring = new Keyring({type: 'ed25519'});
  //   const sr = createPair(
  //     {toSS58: keyring.encodeAddress, type: 'ed25519'},
  //     {publicKey: hexToU8a(edpub), secretKey: hexToU8a(edpri)},
  //     {},
  //   );
  //   const signed = tx.sign(sr, {
  //     blockHash:
  //       '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
  //     genesisHash:
  //       '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
  //     nonce: 1,
  //     runtimeVersion: {
  //       apis: [],
  //       authoringVersion: new BN(2),
  //       implName: 'parity-kusama',
  //       implVersion: new BN(0),
  //       specName: 'kusama',
  //       specVersion: new BN(2022),
  //       transactionVersion: new BN(2),
  //     },
  //   });
  //   console.log(signed.toHuman(true));
  //   console.log(signed.toHex());
  // });
  // it('test api westend', async () => {
  //   const api = await ApiPromise.create();
  //   const transfer = api.tx.balances.transfer(
  //       'EEWyMLHgwtemr48spFNnS3U2XjaYswqAYAbadx2jr9ppp4X',
  //       100000000000,
  //   );
  //   const keyring = new Keyring({type: 'ed25519'});
  //   const sr = createPair(
  //       {toSS58: keyring.encodeAddress, type: 'ed25519'},
  //       {publicKey: hexToU8a(edpub), secretKey: hexToU8a(edpri)},
  //       {},
  //   );
  //   const signed = transfer.sign(sr, {nonce: 1});
  //   console.log(signed.toHex());
  // })
  // it('test offline westend', () => {
  //   const registry = getRegistry('Westend', 'westend', 41);
  //   const decorated = new Decorated(registry, metadata);
  //   const tx = new GenericExtrinsic(
  //       registry,
  //       decorated.tx.balances.transfer(
  //           'EEWyMLHgwtemr48spFNnS3U2XjaYswqAYAbadx2jr9ppp4X',
  //           100000000000,
  //       ),
  //       {version: 4},
  //   );
  //   const keyring = new Keyring({type: 'ed25519'});
  //   const sr = createPair(
  //       {toSS58: keyring.encodeAddress, type: 'ed25519'},
  //       {publicKey: hexToU8a(edpub), secretKey: hexToU8a(edpri)},
  //       {},
  //   );
  //   const signed = tx.sign(sr, {
  //     blockHash:
  //         '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
  //     genesisHash:
  //         '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
  //     nonce: 1,
  //     runtimeVersion: {
  //       apis: [],
  //       authoringVersion: new BN(2),
  //       implName: 'parity-westend',
  //       implVersion: new BN(0),
  //       specName: 'westend',
  //       specVersion: new BN(41),
  //       transactionVersion: new BN(2),
  //     },
  //   });
  //   console.log(signed);
  //   console.log(signed.toHex());
  // });
});
