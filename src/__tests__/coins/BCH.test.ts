import {AddressFormat, BCH} from '../../BCH';
import {AddressType, NetWorkType} from '../../BTC';
import keyProvider, {
  SignProviderWithPrivateKeySync,
} from '../../BTC/keyProvider';

const privateKey =
  'e00f3c5bc590eb33399dc4336b2cf0887b790580503c10aae054039cfa9065e6';
const publicKey =
  '02c1b6f5e4917cbc628d914e2f1155e4195504ab3bfa58e4a8d367896c9d8016f8';

const kpSync = SignProviderWithPrivateKeySync(privateKey, publicKey);

const kp = keyProvider(privateKey, publicKey);

// https://bch.btc.com/2347c3307db78ba5efda4a6a283abf8e5e2f7b700f42513c12371afa211f6ea7
const txData = {
  inputs: [
    {
      hash: '053ae8aaef4b2991807503d60a9031fad2d9e7dae9027968baea9a7493f2fc37',
      index: 0,
      value: 805000,
      pubkey:
        '02c1b6f5e4917cbc628d914e2f1155e4195504ab3bfa58e4a8d367896c9d8016f8',
    },
  ],
  outputs: [
    {
      address: '1HXQeKa8YSg1bEoToLqxXcHfm4Wrt4qk3V',
      value: 700000,
    },
    {
      address: '18ZyEqa4ioSiTztN5zHRNoQCr5ZYtMNTjJ',
      value: 100000,
    },
  ],
};

describe('coin.BCH', () => {
  const bch = new BCH(NetWorkType.mainNet);

  it('should generate correct address', () => {
    expect(
      bch.generateAddress(publicKey, AddressType.P2PKH, AddressFormat.CASH),
    ).toBe('bitcoincash:qpfs2gcfwg322segkj4h30du4vtjyvsxtq6msk90a5');
    expect(bch.generateAddress(publicKey)).toBe(
      '18ZyEqa4ioSiTztN5zHRNoQCr5ZYtMNTjJ',
    );
    expect(
      bch.generateAddress(publicKey, AddressType.P2PKH, AddressFormat.BITPAY),
    ).toBe('CQ2rosv8brRFN8nnmjcLxK2EUCmxrY8gJf');
  });

  it('should valid a address', () => {
    const result = bch.isAddressValid('3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj');
    expect(result).toBe(true);
    const failResult = bch.isAddressValid('3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pu');
    expect(failResult).toBe(false);
    const failedResult = bch.isAddressValid('0xtastere2uieuriur');
    expect(failedResult).toBe(false);
    const validResult1 = bch.isAddressValid(
      'bitcoincash:qr5ulyf3m8qz5wsz6frtks5hk4sxcm9jlyqnpsdfkj',
    );
    expect(validResult1).toBe(true);
    const failResult2 = bch.isAddressValid(
      'bitcoincash:qr5ulyf3m8qz5wsz6frtks5hk4sxcm9jlyqnpsdfk',
    );
    expect(failResult2).toBe(false);
  });

  it('should generate the transaction sync', async () => {
    const result = bch.generateTransactionSync(txData, [kpSync]);
    expect(result.txId).toEqual(
      '2347c3307db78ba5efda4a6a283abf8e5e2f7b700f42513c12371afa211f6ea7',
    );
    expect(result.txHex).toEqual(
      '020000000137fcf293749aeaba687902e9dae7d9d2fa31900ad603758091294befaae83a05000000006a47304402204781564e25515e00f1487d9a0a772e19dac9ec13d8cd92190fb5d825e769423d022043a0ee25481a9e21042e033384feadc6005383586377572d8196cf7d5a0006b6412102c1b6f5e4917cbc628d914e2f1155e4195504ab3bfa58e4a8d367896c9d8016f8ffffffff0260ae0a00000000001976a914b5423a5b2ab6af3a174cf2e53a3c85190418163688aca0860100000000001976a914530523097222a54328b4ab78bdbcab172232065888ac00000000',
    );
  });

  it('should generate the transaction sync if kpsync is duplicated', async () => {
    const result = bch.generateTransactionSync(txData, [kpSync, kpSync]);
    expect(result.txId).toEqual(
      '2347c3307db78ba5efda4a6a283abf8e5e2f7b700f42513c12371afa211f6ea7',
    );
    expect(result.txHex).toEqual(
      '020000000137fcf293749aeaba687902e9dae7d9d2fa31900ad603758091294befaae83a05000000006a47304402204781564e25515e00f1487d9a0a772e19dac9ec13d8cd92190fb5d825e769423d022043a0ee25481a9e21042e033384feadc6005383586377572d8196cf7d5a0006b6412102c1b6f5e4917cbc628d914e2f1155e4195504ab3bfa58e4a8d367896c9d8016f8ffffffff0260ae0a00000000001976a914b5423a5b2ab6af3a174cf2e53a3c85190418163688aca0860100000000001976a914530523097222a54328b4ab78bdbcab172232065888ac00000000',
    );
  });

  it('should generate the transaction async', async () => {
    const result = await bch.generateTransaction(txData, [kp]);
    expect(result.txId).toEqual(
      '2347c3307db78ba5efda4a6a283abf8e5e2f7b700f42513c12371afa211f6ea7',
    );
    expect(result.txHex).toEqual(
      '020000000137fcf293749aeaba687902e9dae7d9d2fa31900ad603758091294befaae83a05000000006a47304402204781564e25515e00f1487d9a0a772e19dac9ec13d8cd92190fb5d825e769423d022043a0ee25481a9e21042e033384feadc6005383586377572d8196cf7d5a0006b6412102c1b6f5e4917cbc628d914e2f1155e4195504ab3bfa58e4a8d367896c9d8016f8ffffffff0260ae0a00000000001976a914b5423a5b2ab6af3a174cf2e53a3c85190418163688aca0860100000000001976a914530523097222a54328b4ab78bdbcab172232065888ac00000000',
    );
  });

  it('should generate the transaction async if kp is duplicated', async () => {
    const result = await bch.generateTransaction(txData, [kp, kp]);
    expect(result.txId).toEqual(
      '2347c3307db78ba5efda4a6a283abf8e5e2f7b700f42513c12371afa211f6ea7',
    );
    expect(result.txHex).toEqual(
      '020000000137fcf293749aeaba687902e9dae7d9d2fa31900ad603758091294befaae83a05000000006a47304402204781564e25515e00f1487d9a0a772e19dac9ec13d8cd92190fb5d825e769423d022043a0ee25481a9e21042e033384feadc6005383586377572d8196cf7d5a0006b6412102c1b6f5e4917cbc628d914e2f1155e4195504ab3bfa58e4a8d367896c9d8016f8ffffffff0260ae0a00000000001976a914b5423a5b2ab6af3a174cf2e53a3c85190418163688aca0860100000000001976a914530523097222a54328b4ab78bdbcab172232065888ac00000000',
    );
  });

  it('should signMessage', () => {
    const message = bch.signMessageSync('hello', kpSync);
    expect(message).toEqual(
      'f1878d7e14434a1514566f184a64deb9534f6491a8bbf72d921ec02834714fce56127cf12942fe5e4b44cfac68003d846095b8fd112c4a6b99d60b8fd70bbfa3',
    );
  });
  it('should signMessage sync', async () => {
    const message = await bch.signMessage('hello', kp);
    expect(message).toEqual(
      'f1878d7e14434a1514566f184a64deb9534f6491a8bbf72d921ec02834714fce56127cf12942fe5e4b44cfac68003d846095b8fd112c4a6b99d60b8fd70bbfa3',
    );
  });
});
