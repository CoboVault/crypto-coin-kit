// @ts-ignore
import keyProvider, {
  SignProviderWithPrivateKeySync,
} from '../../BTC/keyProvider';
import {HNS} from '../../HNS';

describe('coin.HNS', () => {
  const hns = new HNS();
  // m/44'/5355'/0'/0/0
  const regtestPubkey =
    '02c60b6bb309cb019a7d39a7ed069ef609b4e14f66faf0f0f3e807b823c9077486';
  const regtestPrikey =
    '4c27597fe661367e7203e7c2ff0b5b1f4d3b1e4b309161964be6df14a90f5593';
  // m/44'/5353'/0'/0/0
  const mainnetPubkey =
    '033ff08bc214eb6187ac9701908277226dec4052fde49e48e445c3b7c7da0c7f36';
  const mainnetPrikey =
    '5f156245d4cebe64addb86fe08f96b44629bbae75176833e558bc7bf65f7f43b';
  it('should generate address', () => {
    expect(hns.generateAddress(regtestPubkey, 'regtest')).toBe(
      'rs1qtc022nmph8lql7k4cr8jtk0ezyk68hu65h2l8t',
    );
    expect(hns.generateAddress(mainnetPubkey)).toBe(
      'hs1qwmuglcrwcmvjjg3yl0vec99gqpsdnm4v0q04q8',
    );
  });

  it('should generate tx async', async () => {
    const regtestTx = await hns.generateTransaction(
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
    expect(regtestTx.txHex).toBe(
      '000000000176f330ef29970de6e696358af9adaa25bac95dff2e0cd2ec70d25b2256e4a39a00000000ffffffff0200ca9a3b0000000000147cebeda596462f5eade42492617b0bc674109da30000009d693a0000000000145e1ea54f61b9fe0ffad5c0cf25d9f9112da3df9a0000000000000241fa1221c30a0559cbf64d6860742d9ac9b74a38c0605e62c6ca224b3598083c72581ce95ad937737590168ad8af3c12ea038746f4601a5e45d1098b862bd13420012102c60b6bb309cb019a7d39a7ed069ef609b4e14f66faf0f0f3e807b823c9077486',
    );
    expect(regtestTx.txId).toBe(
      'd77e5a182a8424199440c86ca00a6894ad8f21bf61449bbdc27b928ddfa9a192',
    );

    const mainnetTx = await hns.generateTransaction(
      {
        inputs: [
          {
            pubkey: mainnetPubkey,
            value: 100000,
            hash:
              'cf8b9cab64686ffe0601f6fe701209947bfc4aa74614e940227e5df5a65552b0',
            index: 0,
          },
        ],
        outputs: [
          {
            address: 'hs1qtzf4npr5krmdmqkmhuz4azmgqllr6trqmxcvhx',
            value: 50000,
          },
          {
            address: 'hs1qwmuglcrwcmvjjg3yl0vec99gqpsdnm4v0q04q8',
            value: 40000,
          },
        ],
      },
      [keyProvider(mainnetPrikey, mainnetPubkey)],
    );
    expect(mainnetTx).toStrictEqual({
      txId: '8ac0ce7d16892f2fe40457eba6025ccc2ff698c628becb1ee7e99e175ae9a5a0',
      txHex:
        '0000000001cf8b9cab64686ffe0601f6fe701209947bfc4aa74614e940227e5df5a65552b000000000ffffffff0250c300000000000000145893598474b0f6dd82dbbf055e8b6807fe3d2c600000409c000000000000001476f88fe06ec6d9292224fbd99c14a80060d9eeac00000000000002412342ed52368690ad16e6cf5559cf637bbd00ecb14371cfac5f086880fbf20f0f324b460dbe97b07ab0c3190dfb61c695c4f84b135fa61ac932537200ff191f170121033ff08bc214eb6187ac9701908277226dec4052fde49e48e445c3b7c7da0c7f36',
    });
  });

  it('should generate tx sync', () => {
    const regtestTx = hns.generateTransactionSync(
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
    expect(regtestTx.txHex).toBe(
      '000000000176f330ef29970de6e696358af9adaa25bac95dff2e0cd2ec70d25b2256e4a39a00000000ffffffff0200ca9a3b0000000000147cebeda596462f5eade42492617b0bc674109da30000009d693a0000000000145e1ea54f61b9fe0ffad5c0cf25d9f9112da3df9a0000000000000241fa1221c30a0559cbf64d6860742d9ac9b74a38c0605e62c6ca224b3598083c72581ce95ad937737590168ad8af3c12ea038746f4601a5e45d1098b862bd13420012102c60b6bb309cb019a7d39a7ed069ef609b4e14f66faf0f0f3e807b823c9077486',
    );
    expect(regtestTx.txId).toBe(
      'd77e5a182a8424199440c86ca00a6894ad8f21bf61449bbdc27b928ddfa9a192',
    );

    const mainnetTx = hns.generateTransactionSync(
      {
        inputs: [
          {
            pubkey: mainnetPubkey,
            value: 100000,
            hash:
              'cf8b9cab64686ffe0601f6fe701209947bfc4aa74614e940227e5df5a65552b0',
            index: 0,
          },
        ],
        outputs: [
          {
            address: 'hs1qtzf4npr5krmdmqkmhuz4azmgqllr6trqmxcvhx',
            value: 50000,
          },
          {
            address: 'hs1qwmuglcrwcmvjjg3yl0vec99gqpsdnm4v0q04q8',
            value: 40000,
          },
        ],
      },
      [SignProviderWithPrivateKeySync(mainnetPrikey, mainnetPubkey)],
    );
    expect(mainnetTx).toStrictEqual({
      txId: '8ac0ce7d16892f2fe40457eba6025ccc2ff698c628becb1ee7e99e175ae9a5a0',
      txHex:
        '0000000001cf8b9cab64686ffe0601f6fe701209947bfc4aa74614e940227e5df5a65552b000000000ffffffff0250c300000000000000145893598474b0f6dd82dbbf055e8b6807fe3d2c600000409c000000000000001476f88fe06ec6d9292224fbd99c14a80060d9eeac00000000000002412342ed52368690ad16e6cf5559cf637bbd00ecb14371cfac5f086880fbf20f0f324b460dbe97b07ab0c3190dfb61c695c4f84b135fa61ac932537200ff191f170121033ff08bc214eb6187ac9701908277226dec4052fde49e48e445c3b7c7da0c7f36',
    });
  });

  it('should sign message async', async () => {
    const message = 'hello world';
    const result = await hns.signMessage(
      message,
      keyProvider(regtestPrikey, regtestPubkey),
    );
    expect(result).toBe(
      'au1CN2Z1prdbXwOFDwRNEBAucR4M6Xng1RMmwhWY6NMvx3IR9keZTY8jVMtOm6eZliik9ZDoaJhpLejP/Fgy5w==',
    );
  });

  it('should sign message sync', () => {
    const message = 'hello world';
    const result = hns.signMessageSync(
      message,
      SignProviderWithPrivateKeySync(regtestPrikey, regtestPubkey),
    );
    expect(result).toBe(
      'au1CN2Z1prdbXwOFDwRNEBAucR4M6Xng1RMmwhWY6NMvx3IR9keZTY8jVMtOm6eZliik9ZDoaJhpLejP/Fgy5w==',
    );
  });
});
