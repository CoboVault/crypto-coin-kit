import BTC from "../../BTC";
import keyProvider from '../../BTC/keyProvider'

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
    witnessUtxo:{
        publicKey,
        script: 'a914915892366a6cdf24afa6e1c480db2ad88c63378087',
        value: 3578100
    },
    value: 3578100
}

const utxoTwo = {
    hash: '89e5f831aa67e0f0dad44f9e7a5f06322a7270da02b837e3666a486323dc14e0',
    index: 0,
    witnessUtxo:{
        publicKey: publicKeyOne,
        script: 'a914745c56190d1fe8274e7ebe9dd4fe10ca3484959587',
        value: 2524291
    },
    value: 2524291
}

describe("coin.BTC", () => {
    const btc = new BTC('mainNet');
    const xtn = new BTC('testNet')


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
            inputs:[utxoOne, utxoTwo],
            to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
            amount: 102391,
            fee: 1000,
            changeAddres:'2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4' 
        }
        
        const result = await xtn.generateTransaction(txData, [kp1, kp2])
        console.log(result)
    })

});
