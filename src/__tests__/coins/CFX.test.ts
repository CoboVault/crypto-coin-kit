import {CFX, TxData} from '../../CFX';
import {
  SignProviderWithPrivateKey,
  SignProviderWithPrivateKeySync,
} from '../../CFX/signProvider';

describe('coin.CFX', () => {
  const cfx = new CFX();

  const privkey =
    '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const pubkey =
    '0x4646ae5047316b4230d0086c8acec687f00b1cd9d1dc634f6cb358ac0a9a8ffffe77b4dd0a4bfb95851f3b7355c781dd60f8418fc8a65d14907aff47c903a559';
  const addr = '0x1cad0b19bb29d4674531d6f115237e16afce377c';

  const message = 'Hello World';
  const signature =
    '0x6e913e2b76459f19ebd269b82b51a70e912e909b2f5c002312efc27bcc280f3c29134d382aad0dbd3f0ccc9f0eb8f1dbe3f90141d81574ebb6504156b0d7b95f01';

  const data1: TxData = {
    nonce: 0,
    gasPrice: 1,
    gas: 21000,
    to: '0x0123456789012345678901234567890123456789',
    value: 0,
    storageLimit: 0,
    epochHeight: 0,
    chainId: 0,
  };
  const txID1 =
    '0x42bed0d43b492261eee4b1c59a4fcd3a2fa7bc7cc1cd208469d0075f0f0a2e7d';
  const txHex1 =
    '0xf863df8001825208940123456789012345678901234567890123456789808080808080a0a370e3562713fb50513ff5d77f18a7dffe7588d3d05413d28211e300a262c7eea0784961a41aba10dfd5d97193d6c35bfc50a15030254bc91ae5a85df6d79d77b1';

  const data2: TxData = {
    nonce: 127,
    gasPrice: 1,
    gas: 21000,
    to: '0x0123456789012345678901234567890123456789',
    value: 0,
    storageLimit: 0,
    epochHeight: 0,
    chainId: 0,
  };
  const txID2 =
    '0x6d76470ef8eafe44de9f561d15cd1c5178d23569c0214cad740594b9052fc6fd';
  const txHex2 =
    '0xf862df7f01825208940123456789012345678901234567890123456789808080808001a07eab45f2aa3366c28b78f206fac37aac9549a92fa53e7e773be7b73d882d134f9f4a7de333450a596f51dcdc67272f0005ead211645af2dc6d0a9be4688b26c1';

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
    const {txId, txHex} = cfx.generateTransactionSync(
      data1,
      SignProviderWithPrivateKeySync(privkey),
    );
    expect(txId).toBe(txID1);
    expect(txHex).toBe(txHex1);
  });

  it('should sign a tx async', async () => {
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
});
