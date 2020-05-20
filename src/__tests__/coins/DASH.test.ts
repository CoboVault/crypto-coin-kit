import keyProvider, {
  SignProviderWithPrivateKeySync,
} from '../../BTC/keyProvider';
import {DASH} from '../../DASH';

const privateKey =
  '2ff59e46027f3def4ddceb2e54aead2be32d108ae5b32e717137bb73df283e88';
const publicKey =
  '02ef6075495297ce696f6fae4fb1bf1383176c2aad3cc08e7a7dacb31ea74df968';

const kpSync = SignProviderWithPrivateKeySync(privateKey, publicKey);

const kp = keyProvider(privateKey, publicKey);

// https://blockchair.com/dash/transaction/f6c12fbda949a480b47e6986e0d15b358839165a47775cd8c85df566c05e9edd
const txData = {
  inputs: [
    {
      hash: 'dc5b627077f2d4a88345ab24f09e8fd8e1d7ac0f2dd20b138ff2322b45d0c9bd',
      index: 0,
      value: 6646114,
      pubkey:
        '02ef6075495297ce696f6fae4fb1bf1383176c2aad3cc08e7a7dacb31ea74df968',
    },
  ],
  outputs: [
    {
      address: 'XytBC2ADpxBVVqvTpCqpPyqCmUbFLyu3bP',
      value: 3641114,
    },
    {
      address: 'XwGuYDN9dRByb18zKmzBM5r5wnvrMaohGX',
      value: 3000000,
    },
  ],
};

describe('coin.DASH', () => {
  const dash = new DASH();

  it('should generate correct address', () => {
    expect(dash.generateAddress(publicKey)).toBe(
      'XwGuYDN9dRByb18zKmzBM5r5wnvrMaohGX',
    );
  });

  it('should generate tx', async () => {
    const tx = await dash.generateTransaction(txData, [kp]);
    expect(tx.txId).toBe(
      'f6c12fbda949a480b47e6986e0d15b358839165a47775cd8c85df566c05e9edd',
    );
    expect(tx.txHex).toBe(
      '0200000001bdc9d0452b32f28f130bd22d0facd7e1d88f9ef024ab4583a8d4f27770625bdc000000006a4730440220668e8be3ae13b3116ea149d918b3052dfd4f74a405d5fb07db41e16fd7c3384702205d373fda8b9827fe3c51aea1144dd10f03461dcd1ed7943531c7eb5a092f31f5012102ef6075495297ce696f6fae4fb1bf1383176c2aad3cc08e7a7dacb31ea74df968ffffffff021a8f3700000000001976a914fe6fa0be011c851feb2ddad42df145c2455056fa88acc0c62d00000000001976a914e1d3c08e34315f1db97828cf7c285bda8c88c7f788ac00000000',
    );
  });

  it('should generate tx sync', () => {
    const tx = dash.generateTransactionSync(txData, [kpSync]);
    expect(tx.txId).toBe(
      'f6c12fbda949a480b47e6986e0d15b358839165a47775cd8c85df566c05e9edd',
    );
    expect(tx.txHex).toBe(
      '0200000001bdc9d0452b32f28f130bd22d0facd7e1d88f9ef024ab4583a8d4f27770625bdc000000006a4730440220668e8be3ae13b3116ea149d918b3052dfd4f74a405d5fb07db41e16fd7c3384702205d373fda8b9827fe3c51aea1144dd10f03461dcd1ed7943531c7eb5a092f31f5012102ef6075495297ce696f6fae4fb1bf1383176c2aad3cc08e7a7dacb31ea74df968ffffffff021a8f3700000000001976a914fe6fa0be011c851feb2ddad42df145c2455056fa88acc0c62d00000000001976a914e1d3c08e34315f1db97828cf7c285bda8c88c7f788ac00000000',
    );
  });

  it('should signMessage', () => {
    const message = dash.signMessageSync('hello', kpSync);
    expect(message).toEqual(
      '235a55f3cfd863aea9cf105a577a3543e20ec3359a5f752a305de97bea7d35ee3e3650a46ec6bf210e1e5d874a875f7f6ca5df2488373167f7c9847eaa7f28ca',
    );
  });
  it('should signMessage sync', async () => {
    const message = await dash.signMessage('hello', kp);
    expect(message).toEqual(
      '235a55f3cfd863aea9cf105a577a3543e20ec3359a5f752a305de97bea7d35ee3e3650a46ec6bf210e1e5d874a875f7f6ca5df2488373167f7c9847eaa7f28ca',
    );
  });
});
