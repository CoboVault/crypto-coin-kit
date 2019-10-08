import BTC, { NetWorkType } from "../../../BTC";
import keyProvider from '../../../BTC/keyProvider'

const privateKey =
    "06a523eede06e72a472056be31429bb4016fe85f10389be898dbe283233131d0";
const publicKey =
    "03fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72";

const kp1 = keyProvider(privateKey, publicKey)

const privateKeyOne = "dc1429816a0f616f3c815bda70bea0fdef9039a71e1a3b08272f9452a59027c4";

const publicKeyOne = "02f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa2";

const kp2 = keyProvider(privateKeyOne, publicKeyOne)


const utxoOne = {
    hash: 'd07ce19af4ff4088884dcee2cedba39c364e34f7cfd0b35bb2e07c8c15b07355',
    index: 1,
    utxo: {
        publicKey,
        script: 'a914915892366a6cdf24afa6e1c480db2ad88c63378087',
        value: 3578100
    },
}

const utxoTwo = {
    hash: '89e5f831aa67e0f0dad44f9e7a5f06322a7270da02b837e3666a486323dc14e0',
    index: 0,
    utxo: {
        publicKey: publicKeyOne,
        script: 'a914745c56190d1fe8274e7ebe9dd4fe10ca3484959587',
        value: 2524291
    },
    value: 2524291
}

describe("coin.BTC", () => {
    const btc = new BTC(NetWorkType.mainNet);
    const xtn = new BTC(NetWorkType.testNet)


    it("should generate correct address", () => {
        expect(btc.generateAddress(publicKey)).toBe(
            "3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj"
        );

        expect(xtn.generateAddress(publicKey)).toBe(
            "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4"
        );
        expect(xtn.generateAddress(publicKeyOne)).toBe(
            "2N3rUzBBAMqkiSra2o6DCb6LZPReQVU3LVe"
        );
    });


    it("should valid a address", () => {
        const result = btc.isAddressValid('3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj')
        expect(result).toBe(true)
        const failResult = btc.isAddressValid('3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pu')
        expect(failResult).toBe(false)
        const failedResult = btc.isAddressValid('0xtastere2uieuriur')
        expect(failedResult).toBe(false)
    });

    it('should generate the transaction', async () => {
        const txData = {
            inputs: [utxoOne, utxoTwo],
            outputs: {
                to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
                amount: 102391,
                fee: 1000,
                changeAddres: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4'
            }
        }

        const result = await xtn.generateTransaction(txData, [kp1, kp2])
        expect(result.txId).toEqual('34bd17dea44660edf68e21c4024b52bc738aec0a9c052f67fa57d4ab26c334b0')
        expect(result.txHex).toEqual('020000000001025573b0158c7ce0b25bb3d0cff7344e369ca3dbcee2ce4d888840fff49ae17cd00100000017160014e9cf9131d9c02a3a02d246bb4297b5606c6cb2f9ffffffffe014dc2363486a66e337b802da70722a32065f7a9e4fd4daf0e067aa31f8e58900000000171600143007abdafe8f875c3d3b714428e7761494a71f6cffffffff02f78f01000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808798895b000000000017a914915892366a6cdf24afa6e1c480db2ad88c633780870247304402206b891a2c6b2a95bb7b7e25275544f3dd761269392dde98ab65c8f8187194ce0502203061881a7d0e92fd19ac68b77a1fee35d7b6b7b72e8fce369a35088c1b35cca7012103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72024730440220236f1c70df027dd7c0c862c9b89b28cb3fca6a96d4c73f7f565b7cc4b0fdff6902202262c87aec91d1ad9e661d807d5f9a8aaacd8a634028a74013cc2141c8750d13012102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa200000000')
    })

    it('should generate psbt base64 string', () => {
        const txData = {
            inputs: [utxoOne, utxoTwo],
            outputs: {
                to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
                amount: 102391,
                fee: 1000,
                changeAddres: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4'
            }
        }

        const result = xtn.generatePsbt(txData)
        expect(result).toEqual('cHNidP8BAJwCAAAAAlVzsBWMfOCyW7PQz/c0Tjaco9vO4s5NiIhA//Sa4XzQAQAAAAD/////4BTcI2NIambjN7gC2nByKjIGX3qeT9Ta8OBnqjH45YkAAAAAAP////8C948BAAAAAAAXqRSRWJI2amzfJK+m4cSA2yrYjGM3gIeYiVsAAAAAABepFJFYkjZqbN8kr6bhxIDbKtiMYzeAhwAAAAAAAQEg9Jg2AAAAAAAXqRSRWJI2amzfJK+m4cSA2yrYjGM3gIcBBBYAFOnPkTHZwCo6AtJGu0KXtWBsbLL5AAEBIIOEJgAAAAAAF6kUdFxWGQ0f6CdOfr6d1P4QyjSElZWHAQQWABQwB6va/o+HXD07cUQo53YUlKcfbAAAAA==')
    })


    it('should parse pbst string', () => {
        const txData = {
            inputs: [utxoOne, utxoTwo],
            outputs: {
                to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
                amount: 102391,
                fee: 1000,
                changeAddres: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4'
            }
        }

        const result = xtn.generatePsbt(txData)
        const tx = xtn.parsePsbt(result)
        expect(tx.inputs.length).toBe(2)
        expect(tx.inputs[0].txId).toEqual('d07ce19af4ff4088884dcee2cedba39c364e34f7cfd0b35bb2e07c8c15b07355')
        expect(tx.inputs[1].txId).toEqual('89e5f831aa67e0f0dad44f9e7a5f06322a7270da02b837e3666a486323dc14e0')
        expect(tx.outputs[0].address).toEqual('2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4')
        expect(tx.outputs[1].address).toEqual('2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4')
        expect(tx.outputs[0].value).toEqual(102391)
        expect(tx.outputs[1].value).toEqual(5999000)
    })
});
