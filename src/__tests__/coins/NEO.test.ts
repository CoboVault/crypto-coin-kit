import NEO from '../../NEO'
import { SignProviderWithPrivateKey } from '../../NEO/utils'
import { wallet, tx, rpc } from '@cityofzion/neon-core'

describe('coin.NEO', () => {
    it('should get right address when generate the address', () => {
        const testPublicKey = '03cf9257d37f4ed524ba90a794fd96b958f3d7b3a4d2bb6baa11b120d15eade3d1'
        const address = new NEO().generateAddress(testPublicKey)
        expect(address).toEqual("AVr6BhSsy64hZqz4dFehX62o2UxsotXf2z")  
    })

    it('should generate unsigned tx', async () => {
       const neoBalance = new wallet.Balance({
            address: 'AVr6BhSsy64hZqz4dFehX62o2UxsotXf2z',
            net: 'TestNet',
            assetSymbols: ['NEO', "GAS"],
            assets: {
                GAS: {
                    balance: 1000,
                    unspent: [
                        {
                            value: 1000,
                            txid: "8568ea9a61315c36f0b04864cedb546a02fd4fb31a93d1308eb92dddd8239982",
                            index: 0,
                        }
                    ]
                },
                NEO: {
                    balance: 1000,
                    unspent: [
                        {
                            value: 1000,
                            txid: "2faaeb2d1ef3d60f583d013574fcaef49651c507078663b0c1efef5a802bbc19",
                            index: 0,
                        }
                    ]
                }
            }
       })

       const neo = new NEO()

       const unsignedTx = neo.generateUnsignedTransaction({
            to: "AdeLEMZrNSA7wn5koFxL2AG35UHvFU1vf5",
            amount: 10,
            memo: 'test net neo',
            balance: neoBalance
       })

       const pKSignProvider = SignProviderWithPrivateKey('2181be39a81f8fd84a785455bf44ff2f44582c5c03cd9e92a63cf026469f835e')
       
       const result = await neo.sign(unsignedTx, pKSignProvider)
       expect(result['id']).toEqual('7105c4c478cb7c0c0cdd333bd05d2719a9974ed2a29982d7c695620821849fe0')
       expect(result['hex']).toEqual('800001f00c74657374206e6574206e656f0119bc2b805aefefc1b063860707c55196f4aefc7435013d580fd6f31e2debaa2f0000029b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc500ca9a3b00000000efe5a16b0d98a09c8d7a4ec2f6788de68de726539b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc5001edc0c170000009a5de415a8276d2aee166d685c3afaeffb9d23ab014140bf5d27187bd8fc04ebc4ad4f69e4c0ecb0ac2bd9c3f879b747984a3217282f0e249ef4e1edf4ffb5dd5bbcccfc66610e183cdc64206a6b26855219a5f611bae5232103cf9257d37f4ed524ba90a794fd96b958f3d7b3a4d2bb6baa11b120d15eade3d1ac')
    })
})