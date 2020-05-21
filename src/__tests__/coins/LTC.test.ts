import keyProvider from '../../BTC/keyProvider';
import {LTC} from '../../LTC';

const privateKey =
  'daf22c62736fede949674e4240a6de143bb2b945d533e551bae01a33c31ab202';
const publicKey =
  '0203bcea542e8e16830fd5a8cbbf36419aa7b23b723e316081a720966dfb280190';

const kp1 = keyProvider(privateKey, publicKey);

// https://live.blockcypher.com/ltc/tx/7d394fe2946d47d7fe1e3192bf5d93ef6fdc9596790029cffde345d037bdc251/
const utxoOne = {
  hash: '8917e49d39914019550e2b0b7678efe5a474d5887e4a8196216621075a46e0dc',
  index: 0,
  utxo: {
    publicKey,
    value: 2985386,
  },
  bip32Derivation: [
    {
      pubkey: Buffer.from(publicKey, 'hex'),
      masterFingerprint: Buffer.from('01010101', 'hex'),
      path: `m/49'/0'/0'/0/0`,
    },
  ],
};

describe('coin.LTC', () => {
  const ltc = new LTC();

  it('should generate correct address', () => {
    expect(ltc.generateAddress(publicKey)).toBe(
      'MWtCcUWEFTtMYZv83by9j2epVcLwYoRrKd',
    );
  });

  it('should valid a address', () => {
    const result = ltc.isAddressValid('MM9gKGzN2n2V9a4pcJY2JRGjhUQCcciCED');
    expect(result).toBe(true);
    const failResult = ltc.isAddressValid('3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj');
    expect(failResult).toBe(true);
  });

  it('should convert a address', () => {
    const result = ltc.convertAddress('MM9gKGzN2n2V9a4pcJY2JRGjhUQCcciCED');
    expect(result).toBe('3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj');
    const failResult = ltc.convertAddress('3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj');
    expect(failResult).toBe('MM9gKGzN2n2V9a4pcJY2JRGjhUQCcciCED');
  });

  it('should generate the transaction', async () => {
    const txData = {
      inputs: [utxoOne],
      outputs: {
        to: 'MKkaG1dzsRykP2S3SB1Mk8KLb2f9hS7xyb',
        amount: 2985186,
        fee: 200,
        changeAddress: 'MWtCcUWEFTtMYZv83by9j2epVcLwYoRrKd',
      },
    };

    const result = await ltc.generateTransaction(txData, [kp1]);
    expect(result.txId).toEqual(
      '1036c090dd43951623d2405c9710a5bdab6b1ac042010edf61bebef07b82b9dc',
    );
    expect(result.txHex).toEqual(
      '02000000000101dce0465a0721662196814a7e88d574a4e5ef78760b2b0e55194091399de41789000000001716001413fb3732def26e6d6f36b405812e3686a0e2c3d9ffffffff01e28c2d000000000017a9148201d29cb56db9a1529038f599788d1ecd5d38878702483045022100be5d839f3f4bff2822a263eeafb0935590779e9fc7dbdc1a08837a63f07e9e8a022034c27388c372fee2e7b306aa973577238789bb7f5d27e4909577d175897192b801210203bcea542e8e16830fd5a8cbbf36419aa7b23b723e316081a720966dfb28019000000000',
    );
  });

  it('should generate the transaction to legacy address', async () => {
    const txData = {
      inputs: [utxoOne],
      outputs: {
        to: '3DYRx8E2vK8KaXA9LJ21vV4wGL4hmRYmCL',
        amount: 2985186,
        fee: 200,
        changeAddress: '3Qg4Jb6GJM2vk4eDwiyouPQRAukVa5Mbk7',
      },
    };

    const result = await ltc.generateTransaction(txData, [kp1]);
    expect(result.txId).toEqual(
      '1036c090dd43951623d2405c9710a5bdab6b1ac042010edf61bebef07b82b9dc',
    );
    expect(result.txHex).toEqual(
      '02000000000101dce0465a0721662196814a7e88d574a4e5ef78760b2b0e55194091399de41789000000001716001413fb3732def26e6d6f36b405812e3686a0e2c3d9ffffffff01e28c2d000000000017a9148201d29cb56db9a1529038f599788d1ecd5d38878702483045022100be5d839f3f4bff2822a263eeafb0935590779e9fc7dbdc1a08837a63f07e9e8a022034c27388c372fee2e7b306aa973577238789bb7f5d27e4909577d175897192b801210203bcea542e8e16830fd5a8cbbf36419aa7b23b723e316081a720966dfb28019000000000',
    );
  });
});
