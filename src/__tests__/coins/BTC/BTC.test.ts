import {BTC, NetWorkType} from '../../../BTC';
import keyProvider from '../../../BTC/keyProvider';
import * as bitcoin from 'bitcoinjs-lib';
import {mnemonicToSeedSync} from 'bip39';

const privateKey =
  '06a523eede06e72a472056be31429bb4016fe85f10389be898dbe283233131d0';
const publicKey =
  '03fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72';

const kp1 = keyProvider(privateKey, publicKey);

const privateKeyOne =
  'dc1429816a0f616f3c815bda70bea0fdef9039a71e1a3b08272f9452a59027c4';

const publicKeyOne =
  '02f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa2';

const kp2 = keyProvider(privateKeyOne, publicKeyOne);

const utxoOne = {
  hash: 'd07ce19af4ff4088884dcee2cedba39c364e34f7cfd0b35bb2e07c8c15b07355',
  index: 1,
  sequence: 0xffffffff,
  utxo: {
    publicKey,
    script: 'a914915892366a6cdf24afa6e1c480db2ad88c63378087',
    value: 3578100,
  },
  bip32Derivation: [
    {
      pubkey: Buffer.from(publicKey, 'hex'),
      masterFingerprint: Buffer.from('01010101', 'hex'),
      path: `m/49'/0'/0'/0/0`,
    },
  ],
};

const utxoTwo = {
  hash: '89e5f831aa67e0f0dad44f9e7a5f06322a7270da02b837e3666a486323dc14e0',
  index: 0,
  utxo: {
    publicKey: publicKeyOne,
    script: 'a914745c56190d1fe8274e7ebe9dd4fe10ca3484959587',
    value: 2524291,
  },
  bip32Derivation: [
    {
      pubkey: Buffer.from(publicKeyOne, 'hex'),
      masterFingerprint: Buffer.from('01010101', 'hex'),
      path: `m/49'/0'/0'/0/0`,
    },
  ],
};

const multiSignUtxo = [
  {
    hash: 'ef0323f679a2406165ab490d24b8fa5773b7721e7cd6e421098f00a9afdc7ee0',
    index: 0,
    utxo: {
      publicKeys: [publicKey, publicKeyOne],
      value: 11110,
    },
  },
];

const omniMultiSignUtxo = [
  {
    hash: '6b57bb3631466c29739d576b86ba142b7f59aab1d2224c013ac914b109623e7d',
    index: 1,
    utxo: {
      publicKeys: [publicKey, publicKeyOne],
      value: 19999,
    },
  },
];

describe('coin.BTC', () => {
  const btc = new BTC(NetWorkType.mainNet);
  const xtn = new BTC(NetWorkType.testNet);

  it('should generate correct address', () => {
    expect(btc.generateAddress(publicKey)).toBe(
      '3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj',
    );

    expect(xtn.generateAddress(publicKey)).toBe(
      '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
    );
    expect(xtn.generateAddress(publicKeyOne)).toBe(
      '2N3rUzBBAMqkiSra2o6DCb6LZPReQVU3LVe',
    );

    expect(xtn.generateMultiSignAddress([publicKey, publicKeyOne], 2)).toBe(
      '2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V',
    );
  });

  it('should valid a address', () => {
    const result = btc.isAddressValid('3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj');
    expect(result).toBe(true);
    const failResult = btc.isAddressValid('3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pu');
    expect(failResult).toBe(false);
    const failedResult = btc.isAddressValid('0xtastere2uieuriur');
    expect(failedResult).toBe(false);
    const validP2wpkhAddr = 'bc1qcsfgcpf0nhcqg7psw2729a6cld7z4fsq4w7qtz';
    expect(btc.isAddressValid(validP2wpkhAddr)).toBe(true);
    const validP2wshAddr =
      'bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej';
    expect(btc.isAddressValid(validP2wshAddr)).toBe(true);
    const invalidP2wshAddr =
      'bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvze';
    expect(btc.isAddressValid(invalidP2wshAddr)).toBe(false);
  });

  it('should generate the transaction', async () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 102391,
        fee: 1000,
        changeAddress: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      },
      version: 2,
      locktime: 0,
    };

    const result = await xtn.generateTransaction(txData, [kp1, kp2]);
    expect(result.txId).toEqual(
      '34bd17dea44660edf68e21c4024b52bc738aec0a9c052f67fa57d4ab26c334b0',
    );
    expect(result.txHex).toEqual(
      '020000000001025573b0158c7ce0b25bb3d0cff7344e369ca3dbcee2ce4d888840fff49ae17cd00100000017160014e9cf9131d9c02a3a02d246bb4297b5606c6cb2f9ffffffffe014dc2363486a66e337b802da70722a32065f7a9e4fd4daf0e067aa31f8e58900000000171600143007abdafe8f875c3d3b714428e7761494a71f6cffffffff02f78f01000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808798895b000000000017a914915892366a6cdf24afa6e1c480db2ad88c633780870247304402206b891a2c6b2a95bb7b7e25275544f3dd761269392dde98ab65c8f8187194ce0502203061881a7d0e92fd19ac68b77a1fee35d7b6b7b72e8fce369a35088c1b35cca7012103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72024730440220236f1c70df027dd7c0c862c9b89b28cb3fca6a96d4c73f7f565b7cc4b0fdff6902202262c87aec91d1ad9e661d807d5f9a8aaacd8a634028a74013cc2141c8750d13012102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa200000000',
    );
  });

  it('should generate the transaction with locktime and version 1', async () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 102391,
        fee: 1000,
        changeAddress: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      },
      version: 1,
      locktime: 628083,
    };

    const result = await xtn.generateTransaction(txData, [kp1, kp2]);
    expect(result.txId).toEqual(
      '17eca42ddd5cb440636c333c79b6fee67dfe1368da3790b2022d5f61bd58fc62',
    );
    expect(result.txHex).toEqual(
      '010000000001025573b0158c7ce0b25bb3d0cff7344e369ca3dbcee2ce4d888840fff49ae17cd00100000017160014e9cf9131d9c02a3a02d246bb4297b5606c6cb2f9ffffffffe014dc2363486a66e337b802da70722a32065f7a9e4fd4daf0e067aa31f8e58900000000171600143007abdafe8f875c3d3b714428e7761494a71f6cffffffff02f78f01000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808798895b000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808702483045022100f5b55b77cc6379a73767e31f759b4f1dbb3ae9a544cfd5c78bf7a4ef4be339880220210ed1a9a60d75ce1fe9224618ffc9af331256d674dc497a8df1d3630b91f431012103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72024730440220335114f2b9b3805eef2607c3b699d788187eab54c0279edb3d28a59c507ba1d2022007d32006272932820aaeb5d140469edeb62ba325fae5ad97ee9da376bf1c20e9012102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa273950900',
    );
  });

  it('should generate the transaction even if it have duplicated key provider', async () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 102391,
        fee: 1000,
        changeAddress: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      },
    };

    const result = await xtn.generateTransaction(txData, [kp1, kp2, kp1, kp2]);
    expect(result.txId).toEqual(
      '34bd17dea44660edf68e21c4024b52bc738aec0a9c052f67fa57d4ab26c334b0',
    );
    expect(result.txHex).toEqual(
      '020000000001025573b0158c7ce0b25bb3d0cff7344e369ca3dbcee2ce4d888840fff49ae17cd00100000017160014e9cf9131d9c02a3a02d246bb4297b5606c6cb2f9ffffffffe014dc2363486a66e337b802da70722a32065f7a9e4fd4daf0e067aa31f8e58900000000171600143007abdafe8f875c3d3b714428e7761494a71f6cffffffff02f78f01000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808798895b000000000017a914915892366a6cdf24afa6e1c480db2ad88c633780870247304402206b891a2c6b2a95bb7b7e25275544f3dd761269392dde98ab65c8f8187194ce0502203061881a7d0e92fd19ac68b77a1fee35d7b6b7b72e8fce369a35088c1b35cca7012103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72024730440220236f1c70df027dd7c0c862c9b89b28cb3fca6a96d4c73f7f565b7cc4b0fdff6902202262c87aec91d1ad9e661d807d5f9a8aaacd8a634028a74013cc2141c8750d13012102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa200000000',
    );
  });

  it('should generate psbt base64 string', () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 102391,
        fee: 1000,
        changeAddress: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      },
    };

    const result = xtn.generatePsbt(txData);
    expect(result).toEqual(
      'cHNidP8BAJwCAAAAAlVzsBWMfOCyW7PQz/c0Tjaco9vO4s5NiIhA//Sa4XzQAQAAAAD/////4BTcI2NIambjN7gC2nByKjIGX3qeT9Ta8OBnqjH45YkAAAAAAP////8C948BAAAAAAAXqRSRWJI2amzfJK+m4cSA2yrYjGM3gIeYiVsAAAAAABepFJFYkjZqbN8kr6bhxIDbKtiMYzeAhwAAAAAAAQEg9Jg2AAAAAAAXqRSRWJI2amzfJK+m4cSA2yrYjGM3gIcBBBYAFOnPkTHZwCo6AtJGu0KXtWBsbLL5IgYD++AuFtNdPJxncsdbpdDROHVzckCCJm6mZ8U7nQDezXIYAQEBATEAAIAAAACAAAAAgAAAAAAAAAAAAAEBIIOEJgAAAAAAF6kUdFxWGQ0f6CdOfr6d1P4QyjSElZWHAQQWABQwB6va/o+HXD07cUQo53YUlKcfbCIGAvMlqFkC0mTbywy+FE6bJGP4JSvQxRvBlmb0yCRh5LqiGAEBAQExAACAAAAAgAAAAIAAAAAAAAAAAAAAAA==',
    );
  });

  it('should parse pbst string', () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 102391,
        fee: 1000,
        changeAddress: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      },
    };

    const result = xtn.generatePsbt(txData);
    const tx = xtn.parsePsbt(result);
    expect(tx.inputs.length).toBe(2);
    expect(tx.inputs[0].txId).toEqual(
      'd07ce19af4ff4088884dcee2cedba39c364e34f7cfd0b35bb2e07c8c15b07355',
    );
    expect(tx.inputs[1].txId).toEqual(
      '89e5f831aa67e0f0dad44f9e7a5f06322a7270da02b837e3666a486323dc14e0',
    );
    expect(tx.outputs[0].address).toEqual(
      '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
    );
    expect(tx.outputs[1].address).toEqual(
      '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
    );
    expect(tx.outputs[0].value).toEqual(102391);
    expect(tx.outputs[1].value).toEqual(5999000);
    expect(tx.inputs[0].isFinalized).toBe(false);
    expect(tx.inputs[1].isFinalized).toBe(false);
  });

  // https://btc.com/a7263645784c46f36a8200c06d349df82206f8b2b5f16f0ddd9adaf0b1a0f675
  it('should generate omni tx', async () => {
    const privateKey =
      '0437d0a4ae601819365884a858da3f61074e7bedff30b7d716c406e1937092e1';
    const publicKey =
      '02a18c6e271a995b162348b4332b63f13bf031617192d6232e809210ad5d85c382';

    const keyPair = keyProvider(privateKey, publicKey);

    const utxo = {
      hash: '344b4dda373534908be8c14946cf7d27c5161d3f759ef692f0c30c7d6ee604aa',
      index: 0,
      utxo: {
        publicKey,
        value: 3000,
      },
      bip32Derivation: [
        {
          pubkey: Buffer.from(publicKey, 'hex'),
          masterFingerprint: Buffer.from('01010101', 'hex'),
          path: `m/49'/0'/0'/0/0`,
        },
      ],
    };

    const txData = {
      inputs: [utxo],
      to: '38c8FFS9W4QEW55WXgo2wX8HZJCutH89VT',
      fee: 2454,
      changeAddress: '3CAgK3r8nDiMcdnqBUL3Yy7JMFDjvkXqHn',
      omniAmount: 1000,
    };

    const tx = await btc.generateOmniTransaction(txData, [keyPair]);
    expect(tx.txId).toBe(
      '39a775c80554e9fc9d39e8a64c977f31c1dd27140f9ceb9af7c106bd0eb04395',
    );
    expect(tx.txHex).toBe(
      '02000000000101aa04e66e7d0cc3f092f69e753f1d16c5277dcf4649c1e88b90343537da4d4b3400000000171600141ea4ea0a12d7c2b07e9084d36abd03a2edd72798ffffffff020000000000000000166a146f6d6e69000000000000001f00000000000003e8220200000000000017a9144bdc14152999fc8ad8c6df4c20946ba1e572c95e8702483045022100ac2e50d8041d4af85316b052af300ebdd459f6aa51af59e26663ebb07816f7dd02203a398c50bb582c2609ef7a6b0fcea004ee965d68e820d6b16ea8824f60bdbed9012102a18c6e271a995b162348b4332b63f13bf031617192d6232e809210ad5d85c38200000000',
    );
  });

  it('should generate the multiSign transaction', async () => {
    const txData = {
      inputs: multiSignUtxo,
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 10110,
        fee: 1000,
        changeAddress: '2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V',
      },
      version: 2,
      locktime: 0,
      requires: 2,
    };
    const {txId, txHex} = await xtn.generateMultiSignTransaction(txData, [
      kp1,
      kp2,
    ]);

    expect(txId).toBe(
      '8506019f98a692258bc604f53029ccc0e5ab90b2af2bb244aadc00f51160eb86',
    );
    expect(txHex).toBe(
      '02000000000101e07edcafa9008f0921e4d67c1e72b77357fab8240d49ab656140a279f62303ef00000000232200207690f26b840a14f928d7182e348ef3b2faa484e4b34d49ecec1b3013faadb75affffffff017e2700000000000017a914915892366a6cdf24afa6e1c480db2ad88c633780870400483045022100d53c71ff3e2a6014f0389a53cdda8cb5f378e0a9b1ed9f85fc31a80197ea5fe502200c27b2539f6b040feda85760b9c790730def70073e210e837c90620913768d4601473044022007297cc9f35c171b8a044492fb49f5a5c762de0fbfff3ea42896c99ec854cb500220361e9e497f811102547202eafc4340ff9c11403ee43ec10bd5563315b027dce00147522103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd722102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa252ae00000000',
    );
  });

  it('should generate the omni multiSign transaction', async () => {
    const txData = {
      inputs: omniMultiSignUtxo,
      to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      omniAmount: 10110,
      fee: 1000,
      changeAddress: '2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V',
      requires: 2,
    };
    const {txId, txHex} = await xtn.generateOmniMultiSignTransaction(txData, [
      kp1,
      kp2,
    ]);

    expect(txId).toBe(
      '8a1b3bdc52571718bf7bd6952e5465bf4e884a699ec12d62ea4b34c76b1e7618',
    );
    expect(txHex).toBe(
      '020000000001017d3e6209b114c93a014c22d2b1aa597f2b14ba866b579d73296c463136bb576b01000000232200207690f26b840a14f928d7182e348ef3b2faa484e4b34d49ecec1b3013faadb75affffffff03154800000000000017a914ab465b094d7aaad13cbdbdfebb32115690b36ad6870000000000000000166a146f6d6e690000000000000001000000000000277e220200000000000017a914915892366a6cdf24afa6e1c480db2ad88c633780870400483045022100b7ef55a2eb79cefcc7181d29c6fcb189f003bac2bd9556bdfaa5f699d1a8ff2102203e7db828635e8b308bcebe29b76086e4aec85828c449106b4155f829cf26cf9201483045022100f394f3c1c01903a3bf86c16532d6347b105e32863c941974c12f267848d407a102202771098a734f2d6005303914c317656793f9e91d84fa09042d8eeec6a4759efa0147522103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd722102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa252ae00000000',
    );
  });

  it('should generate the omni multiSign transaction signatures', async () => {
    const txData = {
      inputs: omniMultiSignUtxo,
      to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      omniAmount: 10110,
      fee: 1000,
      changeAddress: '2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V',
      requires: 2,
    };
    const signatures = await xtn.getOmniMultiSignTransactionSignature(txData, [
      kp1,
    ]);

    expect(signatures).toStrictEqual([
      '3045022100b7ef55a2eb79cefcc7181d29c6fcb189f003bac2bd9556bdfaa5f699d1a8ff2102203e7db828635e8b308bcebe29b76086e4aec85828c449106b4155f829cf26cf9201',
    ]);
  });

  it('should generate the multiSign transaction signatures', async () => {
    const txData = {
      inputs: multiSignUtxo,
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 10110,
        fee: 1000,
        changeAddress: '2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V',
      },
      version: 2,
      locktime: 0,
      requires: 2,
    };
    const signatures = await xtn.getMultiSignTransactionSignature(txData, [
      kp1,
    ]);

    expect(signatures).toStrictEqual([
      '3045022100d53c71ff3e2a6014f0389a53cdda8cb5f378e0a9b1ed9f85fc31a80197ea5fe502200c27b2539f6b040feda85760b9c790730def70073e210e837c90620913768d4601',
    ]);
  });

  it('should sign a given psbt', async () => {
    // txid: 8ff229d4c946c29750502d1cc105ca69a2a284bfbd2e560bd656cf18e3b78163
    const psbtStr =
      'cHNidP8BAHEBAAAAAfPQ5Rpeu5nH0TImK4Sbu9lxIOGEynRadywPxaPyhnTwAAAAAAD/////AkoRAAAAAAAAFgAUFCYoQzGSRmYVAuZNuXF0OrPg9jWIEwAAAAAAABYAFOZMlwM1sZGLivwOcOh77amAlvD5AAAAAAABAR+tKAAAAAAAABYAFM4u9V5WG+Fe9l3MefmYEX4ULWAWIgYDA+jO+oOuN37ABK67BA/+SuuR/57c7OkyfyR7hR34FDsYccBxUlQAAIAAAACAAAAAgAAAAAAFAAAAACICApJMZBvzWiavLN7nievKQoylwPoffLkXZUIgGHF4HgwaGHHAcVJUAACAAAAAgAAAAIABAAAACwAAAAAA';
    const pubkey =
      '0303e8cefa83ae377ec004aebb040ffe4aeb91ff9edcece9327f247b851df8143b';
    const prikey =
      '84f85bacd370966ba523222e6ea8c3bc2731b629e54c0362dd639d04f6fc3cbc';
    const keyProviders = [keyProvider(prikey, pubkey)];
    const result = await btc.signPSBTBase64(psbtStr, keyProviders);
    expect(result.psbtB64).toBe(
      'cHNidP8BAHEBAAAAAfPQ5Rpeu5nH0TImK4Sbu9lxIOGEynRadywPxaPyhnTwAAAAAAD/////AkoRAAAAAAAAFgAUFCYoQzGSRmYVAuZNuXF0OrPg9jWIEwAAAAAAABYAFOZMlwM1sZGLivwOcOh77amAlvD5AAAAAAABAR+tKAAAAAAAABYAFM4u9V5WG+Fe9l3MefmYEX4ULWAWAQhsAkgwRQIhANSbkZmrxoUne1RIwEpJ7rq+r2tGnvhV5/dSZnE9NryTAiAKRQefqR1pTCMuF74bgP0tf39p8Wof5uLHORoPwuGxhAEhAwPozvqDrjd+wASuuwQP/krrkf+e3OzpMn8ke4Ud+BQ7ACICApJMZBvzWiavLN7nievKQoylwPoffLkXZUIgGHF4HgwaGHHAcVJUAACAAAAAgAAAAIABAAAACwAAAAAA',
    );
  });

  it('should parse psbt', () => {
    const str =
      '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';
    const result = btc.parsePsbt(str);
    expect(result).toStrictEqual({
      inputs: [
        {
          txId:
            '087acb49d178649040c0b0f6350b9a0383822640368adffd1e857afe1c2d9ced',
          index: 0,
          value: 2060,
          hdPath: [
            {
              masterFingerprint: '5ad8322d',
              path: 'm/0/0',
              pubkey:
                '0279fff697c2bb79da2f992fbcc20ed97a12ceb8fb192ac7794d4acb72fd4c4408',
            },
            {
              masterFingerprint: 'bea8e3be',
              path: 'm/0/0',
              pubkey:
                '02b08a7c189abff50860cf5531bae6fc53e5838a51b1227402fd9fcfd7fa39a3ab',
            },
            {
              masterFingerprint: 'b064c0bd',
              path: 'm/0/0',
              pubkey:
                '034bf251d4b8b9a984db35cc0aee3eca989cfccdcb1f7d00df869aab7d694ac107',
            },
          ],
          signStatus: '0-2-3',
          isMultiSign: true,
          isFinalized: false,
        },
        {
          txId:
            '6270c33870da6770547e910e27888744d2c4e343406b126069293cb7895ad5f1',
          index: 0,
          value: 7824,
          hdPath: [
            {
              masterFingerprint: 'b064c0bd',
              path: 'm/0/2',
              pubkey:
                '023f8c271c9b4eb7374adbe101bc04b5baa8e29c2ead722e9d45ad09669ea1f9e3',
            },
            {
              masterFingerprint: '5ad8322d',
              path: 'm/0/2',
              pubkey:
                '038ba8057d663eb6ad08fc2e17f0987932f1ff37586a42bfc3b3545c8139b96283',
            },
            {
              masterFingerprint: 'bea8e3be',
              path: 'm/0/2',
              pubkey:
                '03d164afb23de5d7a484cea8af78b270209c1c339e11a370d83c788da699f0f703',
            },
          ],
          signStatus: '0-2-3',
          isMultiSign: true,
          isFinalized: false,
        },
        {
          txId:
            '65a455a2e1c489f4e3304d8e455f4e82158d6c8a70d6fa2872ad3d2cbd9c0770',
          index: 0,
          value: 59557,
          hdPath: [
            {
              masterFingerprint: '5ad8322d',
              path: 'm/0/0',
              pubkey:
                '0279fff697c2bb79da2f992fbcc20ed97a12ceb8fb192ac7794d4acb72fd4c4408',
            },
            {
              masterFingerprint: 'bea8e3be',
              path: 'm/0/0',
              pubkey:
                '02b08a7c189abff50860cf5531bae6fc53e5838a51b1227402fd9fcfd7fa39a3ab',
            },
            {
              masterFingerprint: 'b064c0bd',
              path: 'm/0/0',
              pubkey:
                '034bf251d4b8b9a984db35cc0aee3eca989cfccdcb1f7d00df869aab7d694ac107',
            },
          ],
          signStatus: '0-2-3',
          isMultiSign: true,
          isFinalized: false,
        },
      ],
      outputs: [
        {
          address:
            'bc1q6uk9x0202nvrt27ne28njljyt25cuta26f6g2wju7y8at88x43cqg9n98j',
          value: 44558,
          hdPath: [
            {
              masterFingerprint: 'b064c0bd',
              path: 'm/0/1',
              pubkey:
                '02fb2b75edac997f118de060985ad36231fa99d9b92bc9718de1baaa2a05cc3cbf',
            },
            {
              masterFingerprint: '5ad8322d',
              path: 'm/0/1',
              pubkey:
                '02fb645ad0ddc0e212206783cb6841a67ad6efe4f539a6cd8703978301bc69c5b9',
            },
            {
              masterFingerprint: 'bea8e3be',
              path: 'm/0/1',
              pubkey:
                '03e83be4bb531d0710d632f1130453a3fce8c58444b74ff69d2b6bcf38df05ceeb',
            },
          ],
        },
      ],
    });
  });

  it('should get correct txid', () => {
    const p2shP2wpkh = bitcoin.Psbt.fromBase64(
      'cHNidP8BAJMCAAAAAbPh8oVEWjFssrKEGMuwcQ9ob+cgyTMzQjIVowyOI36WAAAAAAD9////A1gCAAAAAAAAF6kUJIilb/9fzp3tT+dVxUGyQGrMGxKHvAIAAAAAAAAXqRTEs+JvHShRzgl8yJQ8yNTBnWICw4ecxwAAAAAAABepFLKdkrrmUqFkon2jGwUDM9Ou0PBQhxDICQBPAQKVtD8EoMv9LYAAAAHxgsFMbeVFy4ueP0yU3WEqVo8cQty+gK9Ai/XcIh4Q2gJdcPZxu3lfCoY2RFj8oo3OHYBkc7St263s20H4tS2P7RTCICp3MAAAgAAAAIAAAACAAQAAgE8BApW0PwSFXDJPgAAAATfJ/YvF2e879F4u/q65U9YFOciRQQikyaP9aWAWbYH0A2EXXyD7/FQdY3Ju6hy+Q7RnFshgPD/+KV/cPSCMiNasFFJxwHEwAACAAAAAgAAAAIABAACATwEClbQ/BNUFVSGAAAABd8eVw1OCbAej5kH+BxhWByTKZgUEabEG3urXeiH5AjAD0lrpYZuXkam5HCegyYTJMwdCa9vxpBlw6Z3T3MHktPQUdIzGqjAAAIAAAACAAAAAgAEAAIAAAQD4AgAAAAABAaiklQCw7R4Gn79UCB1SB797ILACCTTVbfYGnbra4cxeAQAAABcWABStXAijbS/tCGYuA6Wd+kNhkQ1z2v////8CPg4BAAAAAAAXqRRVsqephS6fZLCZ0/gp2zD0VsJeXYfGkQEAAAAAABepFIxWQEHVEPsiXgxkJ6MF/ZJii5iThwJIMEUCIQCm4n+uAAXsNhO3vqkupn1kJb3Nm50ax2p4q7su3i8UIAIgP0ZcOnQtdskyoPs0GlRZqdJpKrbyYMBMN2zvb7JtlqUBIQNGWUUTtBOJRlVh53sYjazHyBU2d+9usI6O9C5MQ23B9AAAAAABBCIAIHCOfHXYWoUphOKAqGHE/OjWFr6vkUpb09zJw7mq+AzjAQVpUiEC+v6HBurM5QNQFSJ2sfuEmHXK2UttzlpzXrDwbcLkbOchAxZZQS2dClAoq5tKZg5pDCfYVki9Yk6MmzFtXqKvQho7IQOO0DBo2Sw0nljNP8wqqB9f9o02XZKM7/dp7U+a/wQk7VOuIgYC+v6HBurM5QNQFSJ2sfuEmHXK2UttzlpzXrDwbcLkbOccdIzGqjAAAIAAAACAAAAAgAEAAIAAAAAAAAAAACIGAxZZQS2dClAoq5tKZg5pDCfYVki9Yk6MmzFtXqKvQho7HMIgKncwAACAAAAAgAAAAIABAACAAAAAAAAAAAAiBgOO0DBo2Sw0nljNP8wqqB9f9o02XZKM7/dp7U+a/wQk7RxSccBxMAAAgAAAAIAAAACAAQAAgAAAAAAAAAAAAAAAAQAiACC6QvfM887wMm57NxCsBK6Ua5FytOnZ3pU0N6t+NXuacwEBaVIhAhSRqjkKhKOlEPqQjcaTjg5DHPQsKY9aI3KZnku0uNGLIQLVkxYVVaZNXMi8/CG8+gObjoHEWmpwlOSmkQ9/qowUnyEDJlzrrCZBSts+aO9tUbTdNbZL8G/VnE0j6bpBJE0QoIRTriICAhSRqjkKhKOlEPqQjcaTjg5DHPQsKY9aI3KZnku0uNGLHMIgKncwAACAAAAAgAAAAIABAACAAQAAAAAAAAAiAgLVkxYVVaZNXMi8/CG8+gObjoHEWmpwlOSmkQ9/qowUnxx0jMaqMAAAgAAAAIAAAACAAQAAgAEAAAAAAAAAIgIDJlzrrCZBSts+aO9tUbTdNbZL8G/VnE0j6bpBJE0QoIQcUnHAcTAAAIAAAACAAAAAgAEAAIABAAAAAAAAAAA=',
    );
    expect(BTC.getPsbtTxId(p2shP2wpkh)).toBe(
      '87acca26c10f9efbfc2d60eea5e51b4c0d48ec22317c2dc0ca6219dec39f83e4',
    );

    const p2wsh = bitcoin.Psbt.fromBase64(
      'cHNidP8BAJwCAAAAAaiklQCw7R4Gn79UCB1SB797ILACCTTVbfYGnbra4cxeAAAAAAD9////A1gCAAAAAAAAFgAUMiQPaKKW6zDi84toF4fvdFQMmJi8AgAAAAAAABYAFC8mDHonaaSKbscQFijESKFx245KQM4AAAAAAAAiACDA97kU5jNJzZkMOOn19BsotEvCmFFmnNBbB4WMpJZqXQ7ICQBPAQKqftME1QVVIYAAAALk5wr0wV8lR9lkWhNdyVmlSMsF9OrgxOMvgpyVGpJNWAIVqlFlx7eMF4O7NBQPutPdEoWU6iCaYsRcQ+uFV79GKxR0jMaqMAAAgAAAAIAAAACAAgAAgE8BAqp+0wSFXDJPgAAAAtlGGEkduM9SE3L+oCe75+sBbrG85fVMjuZslDlwlwpLA4ETfpWx2dwrX57BdPEfWkf3SkljUxzArxXCefWtWAlWFFJxwHEwAACAAAAAgAAAAIACAACATwECqn7TBKDL/S2AAAACwNAXu8eZHf9Z3yKv9fjj/dw2hIZEZT5ZV8HuLKqfgrkDn9Pgvmq4BR20Q22ZG5Ez1OQ24Gx3+jZTMAtIgvfTd1UUwiAqdzAAAIAAAACAAAAAgAIAAIAAAQD9AwECAAAAAAEB4GVX80AoN9kTSoUYkaIpaTy3Wh5LuOSx6ySuxnSNi+ABAAAAFxYAFK1cCKNtL+0IZi4DpZ36Q2GRDXPa/////wI+DgEAAAAAACIAIE1SDtfK4c30lRdow1YoxsGTerdZz5J6+OR2cJCu99M5yNsCAAAAAAAXqRSMVkBB1RD7Il4MZCejBf2SYouYk4cCSDBFAiEA9CURb8vRCXXLlsepfaOHAKwT1CJ3yzHaG1D+SYtEG4QCIF4C0snjVlYX9/LKmxoeZIC6m3jRUjrVfTd/s7SIwRBKASEDRllFE7QTiUZVYed7GI2sx8gVNnfvbrCOjvQuTENtwfQAAAAAAQVpUiECef/2l8K7edovmS+8wg7ZehLOuPsZKsd5TUrLcv1MRAghArCKfBiav/UIYM9VMbrm/FPlg4pRsSJ0Av2fz9f6OaOrIQNL8lHUuLmphNs1zAruPsqYnPzNyx99AN+Gmqt9aUrBB1OuIgYCef/2l8K7edovmS+8wg7ZehLOuPsZKsd5TUrLcv1MRAgcwiAqdzAAAIAAAACAAAAAgAIAAIAAAAAAAAAAACIGArCKfBiav/UIYM9VMbrm/FPlg4pRsSJ0Av2fz9f6OaOrHHSMxqowAACAAAAAgAAAAIACAACAAAAAAAAAAAAiBgNL8lHUuLmphNs1zAruPsqYnPzNyx99AN+Gmqt9aUrBBxxSccBxMAAAgAAAAIAAAACAAgAAgAAAAAAAAAAAAAAAAQFpUiEDE8ncKI24feStbHquPTAggPM0j05yx2I4rmqqMTF08OchA7PRz+5AMW5s3SRf4qApbQYasKJYUdxjlp+KLWQGlFq+IQP0Gjd8Vy7M8mOBA4RF+8pw4zTcIXM2NOKgJj1M1e4u0FOuIgIDE8ncKI24feStbHquPTAggPM0j05yx2I4rmqqMTF08OccdIzGqjAAAIAAAACAAAAAgAIAAIABAAAAAgAAACICA7PRz+5AMW5s3SRf4qApbQYasKJYUdxjlp+KLWQGlFq+HFJxwHEwAACAAAAAgAAAAIACAACAAQAAAAIAAAAiAgP0Gjd8Vy7M8mOBA4RF+8pw4zTcIXM2NOKgJj1M1e4u0BzCICp3MAAAgAAAAIAAAACAAgAAgAEAAAACAAAAAA==',
    );
    expect(BTC.getPsbtTxId(p2wsh)).toBe(
      '5da965c39dd9a84593b010480fa712a9afbf14fc3737d6b07fcc55bf95196c01',
    );
  });

  it('the multiSign transaction signer count cannot less than requires', async () => {
    const txData = {
      inputs: multiSignUtxo,
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 10110,
        fee: 1000,
        changeAddress: '2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V',
      },
      version: 2,
      locktime: 0,
      requires: 2,
    };

    const testFn = async () => {
      try {
        const {txId, txHex} = await xtn.generateMultiSignTransaction(txData, [
          kp1,
        ]);
      } catch (e) {
        throw new Error(e);
      }
    };

    await expect(testFn()).rejects.toThrow();
  });

  it('should test', () => {
    const psbt1 = bitcoin.Psbt.fromBase64(
      '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',
    );
    expect(BTC.getPsbtTxId(psbt1)).toBe(
      'b61707a3c531440260bb1f155e1793581d271713f8cfb7af36f8faf5fbb1c49a',
    );
  });

  it('should get tx id', () => {
    const psbt = bitcoin.Psbt.fromBase64(
      'cHNidP8BAHMCAAAAAQ7MBRsMF15YhaZ3sHgGbizAPKYSr3bOypyKNxKFJmYyAAAAAAD+////Ar6AAAAAAAAAF6kUPZex00nn1ikCp50/A5BDtiTgk7+HagQBAAAAAAAXqRSLJycITkcWl/R2hQ05c8nNmoAsZYcAAAAAAAEBIKCGAQAAAAAAF6kUiycnCE5HFpf0doUNOXPJzZqALGWHAQcXFgAUkI/J0RhjhQQhBvdm5EGAj5tKkpkBCGsCRzBEAiA0KYgjGfG5gywr6GvmN7PunojQy8huH1QNgW54obc0aAIgAQFc6u/ltmaHf+xiL3xp9sXm+0XmD7+N6b5MnEJ/4cIBIQNmePpJd/iFzd6pDsA9T/yYMPvDJazl+MNu5wRfTJzC3AABABYAFLWf8D5mDoc9YC0Ca4R9qX0usjhVIgIDUnfir2bE12Jyzgm8BapcXOYmn4HMKHAg7cMOXzg4Q10YUnHAcTEAAIABAACAAAAAgAEAAAAFAAAAAAEAFgAUkI/J0RhjhQQhBvdm5EGAj5tKkpkiAgNmePpJd/iFzd6pDsA9T/yYMPvDJazl+MNu5wRfTJzC3BhSccBxMQAAgAEAAIAAAACAAAAAAAEAAAAA',
    );
    expect(BTC.getPsbtTxId(psbt)).toBe(
      'ed8a9412c12faea7b4a9cc65850e7b08bf911490e7af1119f0d8e87cc5ca4667',
    );
  });
});
