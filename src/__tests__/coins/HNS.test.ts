// @ts-ignore
import keyProvider, {
  SignProviderWithPrivateKeySync,
} from '../../BTC/keyProvider';
import {HNS} from '../../HNS';

describe('coin.HNS', () => {
  const hns = new HNS();
  const regtestPubkey =
    '02c60b6bb309cb019a7d39a7ed069ef609b4e14f66faf0f0f3e807b823c9077486';
  const regtestPrikey =
    '4c27597fe661367e7203e7c2ff0b5b1f4d3b1e4b309161964be6df14a90f5593';
  it('should generate address', () => {
    expect(hns.generateAddress(regtestPubkey, 'regtest')).toBe(
      'rs1qtc022nmph8lql7k4cr8jtk0ezyk68hu65h2l8t',
    );
  });

  it('should generate tx async', async () => {
    const result = await hns.generateTransaction(
      {
        inputs: [
          {
            pubkey: regtestPubkey,
            value: 2000000000,
            hash:
              '76f330ef29970de6e696358af9adaa25bac95dff2e0cd2ec70d25b2256e4a39a',
            index: 0,
          },
        ],
        outputs: [
          {
            address: 'rs1q0n47mfvkgch4at0yyjfxz7ctce6pp8dru48qnt',
            value: 1000000000,
          },
          {
            address: 'rs1qtc022nmph8lql7k4cr8jtk0ezyk68hu65h2l8t',
            value: 980000000,
          },
        ],
      },
      [keyProvider(regtestPrikey, regtestPubkey)],
    );
    expect(result.txHex).toBe(
      '000000000176f330ef29970de6e696358af9adaa25bac95dff2e0cd2ec70d25b2256e4a39a00000000ffffffff0200ca9a3b0000000000147cebeda596462f5eade42492617b0bc674109da30000009d693a0000000000145e1ea54f61b9fe0ffad5c0cf25d9f9112da3df9a0000000000000241fa1221c30a0559cbf64d6860742d9ac9b74a38c0605e62c6ca224b3598083c72581ce95ad937737590168ad8af3c12ea038746f4601a5e45d1098b862bd13420012102c60b6bb309cb019a7d39a7ed069ef609b4e14f66faf0f0f3e807b823c9077486',
    );
    expect(result.txId).toBe(
      'd77e5a182a8424199440c86ca00a6894ad8f21bf61449bbdc27b928ddfa9a192',
    );
  });

  it('should generate tx sync', () => {
    const result = hns.generateTransactionSync(
      {
        inputs: [
          {
            pubkey: regtestPubkey,
            value: 2000000000,
            hash:
              '76f330ef29970de6e696358af9adaa25bac95dff2e0cd2ec70d25b2256e4a39a',
            index: 0,
          },
        ],
        outputs: [
          {
            address: 'rs1q0n47mfvkgch4at0yyjfxz7ctce6pp8dru48qnt',
            value: 1000000000,
          },
          {
            address: 'rs1qtc022nmph8lql7k4cr8jtk0ezyk68hu65h2l8t',
            value: 980000000,
          },
        ],
      },
      [SignProviderWithPrivateKeySync(regtestPrikey, regtestPubkey)],
    );
    expect(result.txHex).toBe(
      '000000000176f330ef29970de6e696358af9adaa25bac95dff2e0cd2ec70d25b2256e4a39a00000000ffffffff0200ca9a3b0000000000147cebeda596462f5eade42492617b0bc674109da30000009d693a0000000000145e1ea54f61b9fe0ffad5c0cf25d9f9112da3df9a0000000000000241fa1221c30a0559cbf64d6860742d9ac9b74a38c0605e62c6ca224b3598083c72581ce95ad937737590168ad8af3c12ea038746f4601a5e45d1098b862bd13420012102c60b6bb309cb019a7d39a7ed069ef609b4e14f66faf0f0f3e807b823c9077486',
    );
    expect(result.txId).toBe(
      'd77e5a182a8424199440c86ca00a6894ad8f21bf61449bbdc27b928ddfa9a192',
    );
  });
});
