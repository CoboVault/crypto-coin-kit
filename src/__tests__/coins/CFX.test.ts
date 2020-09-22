import {CFX, TxData} from '../../CFX';
import {
  SignProviderWithPrivateKey,
  SignProviderWithPrivateKeySync,
} from '../../CFX/signProvider';

describe('coin.CFX', () => {
  const cfx = new CFX();

  const privkey =
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const pubkey =
    '0x4646ae5047316b4230d0086c8acec687f00b1cd9d1dc634f6cb358ac0a9a8ffffe77b4dd0a4bfb95851f3b7355c781dd60f8418fc8a65d14907aff47c903a559';
  const addr = '0x1cad0b19bb29d4674531d6f115237e16afce377c';

  const to_addr = '0x0123456789012345678901234567890123456789';
  const contract_addr = '0x87010faf5964d67ed070bc4b8dcafa1e1adc0997';

  const message = 'Hello World';
  const signature =
    '0x6e913e2b76459f19ebd269b82b51a70e912e909b2f5c002312efc27bcc280f3c29134d382aad0dbd3f0ccc9f0eb8f1dbe3f90141d81574ebb6504156b0d7b95f01';

  it('should generate right address', () => {
    expect(cfx.generateAddress(pubkey)).toBe(addr);
  });

  it('should valid an address ', () => {
    [
      '0x1Cad0B19bB29d4674531d6f115237E16afce377C',
      '0x1cad0b19bb29d4674531d6f115237e16afce377c',
      '0x18416599fDdf76126eFfa8DB4880C3A24Fe2152b',
      '0x19c742cec42b9e4eff3b84cdedcde2f58a36f44f',
      '0x176c45928d7c26b0175dec8bf6051108563c62c5',
    ].forEach(s => expect(cfx.isAddressValid(s)).toBeTruthy());

    [
      '0x1cad0b19bb29d4674531d6f115237e16afce377C',
      '0x1cad0B19bB29d4674531d6f115237E16afce377C',
      '0x2cad0b19bb29d4674531d6f115237e16afce377c',
      '0xfcad0b19bb29d4674531d6f115237e16afce377c',
      '0xecad0b19bb29d4674531d6f115237e16afce377c',
    ].forEach(s => expect(cfx.isAddressValid(s)).toBeFalsy());
  });

  it('should sign a tx sync', () => {
    const data1: TxData = {
      nonce: 0,
      gasPrice: '1',
      gas: '21000',
      to: to_addr,
      value: '0',
      storageLimit: 0,
      epochHeight: 0,
      chainId: 0,
    };
    const txID1 =
      '0x42bed0d43b492261eee4b1c59a4fcd3a2fa7bc7cc1cd208469d0075f0f0a2e7d';
    const txHex1 =
      '0xf863df8001825208940123456789012345678901234567890123456789808080808080a0a370e3562713fb50513ff5d77f18a7dffe7588d3d05413d28211e300a262c7eea0784961a41aba10dfd5d97193d6c35bfc50a15030254bc91ae5a85df6d79d77b1';

    const {txId, txHex} = cfx.generateTransactionSync(
      data1,
      SignProviderWithPrivateKeySync(privkey),
    );
    expect(txId).toBe(txID1);
    expect(txHex).toBe(txHex1);
  });

  it('should sign a tx async', async () => {
    const data2: TxData = {
      nonce: 127,
      gasPrice: '1',
      gas: '21000',
      to: to_addr,
      value: '0',
      storageLimit: 0,
      epochHeight: 0,
      chainId: 0,
    };
    const txID2 =
      '0x6d76470ef8eafe44de9f561d15cd1c5178d23569c0214cad740594b9052fc6fd';
    const txHex2 =
      '0xf862df7f01825208940123456789012345678901234567890123456789808080808001a07eab45f2aa3366c28b78f206fac37aac9549a92fa53e7e773be7b73d882d134f9f4a7de333450a596f51dcdc67272f0005ead211645af2dc6d0a9be4688b26c1';

    const {txId, txHex} = await cfx.generateTransaction(
      data2,
      SignProviderWithPrivateKey(privkey),
    );
    expect(txId).toBe(txID2);
    expect(txHex).toBe(txHex2);
  });

  it('should sign message sync', () => {
    const signedMessage = cfx.signMessageSync(
      message,
      SignProviderWithPrivateKeySync(privkey),
    );
    expect(signedMessage).toBe(signature);
  });

  it('should sign message async', async () => {
    const signedMessage = await cfx.signMessage(
      message,
      SignProviderWithPrivateKey(privkey),
    );
    expect(signedMessage).toBe(signature);
  });

  it('should sign a FansCoin token sync', () => {
    const data3: TxData = {
      nonce: 7,
      gasPrice: '1000000000',
      gas: '72359',
      to: to_addr,
      value: '1000000000000000000',
      storageLimit: 0,
      epochHeight: 6988782,
      chainId: 2,
      contractAddress: contract_addr,
    };
    const txID3 =
      '0x318b6fd1fa44d78aa5d59734ecd2eaf02fc5a149fc43d247515583e0aaf71002';
    const txHex3 =
      '0xf8b1f86c07843b9aca0083011aa79487010faf5964d67ed070bc4b8dcafa1e1adc09978080836aa3ee02b844a9059cbb00000000' +
      '000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000d' +
      'e0b6b3a764000080a0c021682512002c62f6f6eb37fb833a82bd93aa93f226bd54a4556cb9f88f1858a00d0e533cc96689f2b2b58e' +
      '766214fbce855e4a493a747b30abe147ae3644e923';

    const {txId, txHex} = cfx.generateTransactionSync(
      data3,
      SignProviderWithPrivateKeySync(privkey),
    );
    expect(txId).toBe(txID3);
    expect(txHex).toBe(txHex3);
  });

  it('should sign a FansCoin token async', async () => {
    const data4: TxData = {
      nonce: 8,
      gasPrice: '1',
      gas: '80000',
      to: to_addr,
      value: '5000000000000000000',
      storageLimit: 0,
      epochHeight: 6988782,
      chainId: 2,
      contractAddress: contract_addr,
    };
    const txID4 =
      '0x7477e5e26c214836dea19c0e0187f03c70d8f7c91741cd25d692fd6486c308ab';
    const txHex4 =
      '0xf8adf8680801830138809487010faf5964d67ed070bc4b8dcafa1e1adc09978080836aa3ee02b844a9059cbb000000000000000' +
      '000000000012345678901234567890123456789012345678900000000000000000000000000000000000000000000000045639182' +
      '44f4000080a085bfd95aaf0d150f8f14ad50f70284213b08ff9806a3ddafe20aaaef4db4b546a0309a3af9105d964b8c46af3ddb0' +
      '655cbb66b0847b4120bcaa1753c17dcd19527';

    const {txId, txHex} = await cfx.generateTransaction(
      data4,
      SignProviderWithPrivateKey(privkey),
    );
    expect(txId).toBe(txID4);
    expect(txHex).toBe(txHex4);
  });
});
