import {DOT} from '../../DOT';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {sr25519KeyProviderSync} from '../keyProviders/Sr25519KeyProvider';
import {schnorrkelDeriveHard} from '@polkadot/util-crypto/index';
import schnorrkelKeypairFromU8a from '@polkadot/util-crypto/schnorrkel/keypair/fromU8a';
import {bufferToU8a, u8aToHex} from '@polkadot/util/index';
import {westend} from '../../DOT/metas';
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
      blockHash:
        '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
      tip: 0,
      nonce: 3,
      implVersion: 0,
      authoringVersion: 2,
      specVersion: 41,
      transactionVersion: 2,
      metaData: westend,
      blockNumber: 0,
    };
    const result = wnd.generateTransactionSync(txData, keyProviderSync);
    const reg = new RegExp(
      '0x3502848cba3d59242abc565c99a47c3afaf23668f2e1b1a76a38ab71868ae2dafca96301([a-f0-9]+)000c0004033e97c7cee955a5f2ab3f9346ed85bf2c1b16fcc1afae3e40942bbab648a036040700e8764817',
    );
    expect(reg.test(result.txHex)).toBe(true);
  });

  it('should generate transaction with tip', () => {
    const keyProviderSync = sr25519KeyProviderSync(privateKey, publicKey);
    const txData = {
      value: 100000000000,
      dest: '5DUmuykcaNu6bVE9R7Ya25oPMw3GkYjYLM2P9b5L1FdoB7kf',
      blockHash:
        '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
      tip: 9000000000,
      nonce: 3,
      implVersion: 0,
      authoringVersion: 2,
      specVersion: 41,
      transactionVersion: 2,
      metaData: westend,
      blockNumber: 0,
    };
    const result = wnd.generateTransactionSync(txData, keyProviderSync);
    const reg = new RegExp(
      '0x4902848cba3d59242abc565c99a47c3afaf23668f2e1b1a76a38ab71868ae2dafca96301([a-f0-9]+)000c07001a71180204033e97c7cee955a5f2ab3f9346ed85bf2c1b16fcc1afae3e40942bbab648a036040700e8764817'
    );
    expect(reg.test(result.txHex)).toBe(true);
  });

  it('should generate dot transaction', () => {
    //https://polkascan.io/polkadot/event/1515777-2
    const keyProviderSync = sr25519KeyProviderSync(privateKey, publicKey);
    const txData = {
      value: 10000000000,
      dest: '16iM7BVPSvuJnjMW5T7rGWv4PTvgybD5sUS1zZyQkEf7DMHY',
      blockHash:
        '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
      tip: 0,
      nonce: 2,
      implVersion: 0,
      authoringVersion: 1,
      specVersion: 18,
      transactionVersion: 4,
      blockNumber: 0,
    };
    const result = dot.generateTransactionSync(txData, keyProviderSync);
    const reg = new RegExp(
      '0x350284' +
        publicKey.slice(2) +
        '01([a-f0-9]+)0008000503fcb5e9e05d33b84ed835726327da187a7f4878c32476d17677df56f6dcc216550700e40b5402',
    );
    expect(reg.test(result.txHex)).toBe(true);
  });

  it('should generate dot transaction 2', () => {
    // https://polkascan.io/polkadot/transaction/0x7f00de556623f70f10164a028e5a7e1612b1bb1b6f5e3cc44ccf9750e93515c2
    const keyProviderSync = sr25519KeyProviderSync(privateKey, publicKey);
    const txData = {
      value: 18000000000,
      dest: '16iM7BVPSvuJnjMW5T7rGWv4PTvgybD5sUS1zZyQkEf7DMHY',
      blockHash:
        '0x241c7db46d169fa643d38351b52bd183b6b250b2c5f1a20324406fee79f3b180',
      tip: 0,
      nonce: 3,
      implVersion: 0,
      authoringVersion: 1,
      specVersion: 18,
      transactionVersion: 4,
      blockNumber: 1517092,
      eraPeriod: 4096,
    };
    const result = dot.generateTransactionSync(txData, keyProviderSync);
    const reg = new RegExp(
      '0x390284' +
        publicKey.slice(2) +
        '01([a-f0-9]+)4b620c000503fcb5e9e05d33b84ed835726327da187a7f4878c32476d17677df56f6dcc21655070034e23004',
    );
    expect(reg.test(result.txHex)).toBe(true);
  });

  it('should generate ksm transaction', () => {
    //https://polkascan.io/kusama/event/3970546-4
    const keyProviderSync = sr25519KeyProviderSync(privateKey, publicKey);
    const txData = {
      value: 200000000000,
      dest: 'HzLd5m7Sj3Hac88Stgyz8wWYbRc2B7r74fMsJENgdyLfNTo',
      blockHash:
        '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
      tip: 0,
      nonce: 0,
      implVersion: 0,
      authoringVersion: 2,
      specVersion: 2023,
      transactionVersion: 3,
      blockNumber: 0,
    };
    const result = ksm.generateTransactionSync(txData, keyProviderSync);
    const reg = new RegExp(
      '0x350284' +
        publicKey.slice(2) +
        '01([a-f0-9]+)0000000403ef7ec6f5de1e6a66195bf6ac754f132c0f6ea6b45957964e11b0bf07c9e737a10700d0ed902e',
    );
    expect(reg.test(result.txHex)).toBe(true);
  });

  it('should generate ksm transaction 2', () => {
    // https://polkascan.io/kusama/transaction/0xb2db30ca1e7dbf8ae295c0649735e3979cd51fd224d21736dbbc720210aff058
    const keyProviderSync = sr25519KeyProviderSync(privateKey, publicKey);
    const txData = {
      value: 1000000000,
      dest: 'HzLd5m7Sj3Hac88Stgyz8wWYbRc2B7r74fMsJENgdyLfNTo',
      blockHash:
        '0xe177365bd86c2033883c8967e0e7f07961679dddd8195ee534071adfee8bee3e',
      tip: 0,
      nonce: 4,
      implVersion: 0,
      authoringVersion: 2,
      specVersion: 2023,
      transactionVersion: 3,
      blockNumber: 3971249,
      eraPeriod: 4096,
    };
    const result = ksm.generateTransactionSync(txData, keyProviderSync);
    const reg = new RegExp(
      '0x310284' +
        publicKey.slice(2) +
        '01([a-f0-9]+)0000403ef7ec6f5de1e6a66195bf6ac754f132c0f6ea6b45957964e11b0bf07c9e737a102286bee',
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
      blockHash:
        '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
      tip: 0,
      nonce: 3,
      implVersion: 0,
      authoringVersion: 2,
      specVersion: 41,
      transactionVersion: 2,
      metaData: westend,
      blockNumber: 0,
    };
    const result = wnd.generateTransactionSync(
      txData,
      keyProviderSync,
      'ed25519',
    );
    expect(result.txHex).toBe(
      '0x350284e9a74f8d59086d4c6b6408020729bcfcb70e7d793c4deb00d7774c0890b9ea20002432b974f1b5ad4996782741bfd1c281d6d7eb6af037d779b5a70f8acd1fc79724b2588fc104bf5f1592a2ed5e8e129d749562408b142dc8665c3a748fa09906000c0004033e97c7cee955a5f2ab3f9346ed85bf2c1b16fcc1afae3e40942bbab648a036040700e8764817',
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
      blockHash:
        '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e',
      blockNumber: 0,
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
      '0x350284e9a74f8d59086d4c6b6408020729bcfcb70e7d793c4deb00d7774c0890b9ea20002432b974f1b5ad4996782741bfd1c281d6d7eb6af037d779b5a70f8acd1fc79724b2588fc104bf5f1592a2ed5e8e129d749562408b142dc8665c3a748fa09906000c0004033e97c7cee955a5f2ab3f9346ed85bf2c1b16fcc1afae3e40942bbab648a036040700e8764817',
    );
  });
});
