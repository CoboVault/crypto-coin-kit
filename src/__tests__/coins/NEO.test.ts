import { networkInterfaces } from 'os';
import NEO from '../../NEO'
import { buildNeoBalance, buildNeoClaims, SignProviderWithPrivateKey } from '../../NEO/utils'
import neoData from '../fixtures/neo';

describe('coin.NEO', () => {
    it('should get right address when generate the address', () => {
        const testPublicKey = '03cf9257d37f4ed524ba90a794fd96b958f3d7b3a4d2bb6baa11b120d15eade3d1'
        const address = new NEO().generateAddress(testPublicKey)
        expect(address).toEqual("AVr6BhSsy64hZqz4dFehX62o2UxsotXf2z")
    })

    it('should generate signed tx', async () => {
        const neoBalance = buildNeoBalance({ ...neoData, net: 'TestNet' })

        const neo = new NEO()

        const unsignedTx = neo.generateUnsignedContractTx({
            tokenName: 'NEO',
            to: "AdeLEMZrNSA7wn5koFxL2AG35UHvFU1vf5",
            amount: 10,
            memo: 'test net neo',
            balance: neoBalance
        })

        const pKSignProvider = SignProviderWithPrivateKey('2181be39a81f8fd84a785455bf44ff2f44582c5c03cd9e92a63cf026469f835e')
 
        const result = await neo.sign(unsignedTx, pKSignProvider)
        expect(result.id).toEqual('7105c4c478cb7c0c0cdd333bd05d2719a9974ed2a29982d7c695620821849fe0')
        expect(result.hex).toEqual('800001f00c74657374206e6574206e656f0119bc2b805aefefc1b063860707c55196f4aefc7435013d580fd6f31e2debaa2f0000029b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc500ca9a3b00000000efe5a16b0d98a09c8d7a4ec2f6788de68de726539b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc5001edc0c170000009a5de415a8276d2aee166d685c3afaeffb9d23ab014140bf5d27187bd8fc04ebc4ad4f69e4c0ecb0ac2bd9c3f879b747984a3217282f0e249ef4e1edf4ffb5dd5bbcccfc66610e183cdc64206a6b26855219a5f611bae5232103cf9257d37f4ed524ba90a794fd96b958f3d7b3a4d2bb6baa11b120d15eade3d1ac')
    })


    it('shoudld genreate signed claim tx', async () => {
        const testClaims = { "unclaimed": 0.2139291, "claimable": [{ "value": 990.0, "unclaimed": 0.2139291, "txid": "7105c4c478cb7c0c0cdd333bd05d2719a9974ed2a29982d7c695620821849fe0", "sys_fee": 0.068607, "start_height": 2879709, "n": 1, "generated": 0.1453221, "end_height": 2881806 }], "address": "AVr6BhSsy64hZqz4dFehX62o2UxsotXf2z" }
        const claim = buildNeoClaims(testClaims.address, 'TestNet', testClaims.claimable)
        
        const neo = new NEO()
        const unsignedTx = neo.generateUnsignedClaimTx(claim)
        const pKSignProvider = SignProviderWithPrivateKey('2181be39a81f8fd84a785455bf44ff2f44582c5c03cd9e92a63cf026469f835e')

        const result = await neo.sign(unsignedTx, pKSignProvider)
        expect(result.id).toEqual('ca9b1b3473cdca9457610754163cf201605c9edf21a26e2b601f7fb647b831b2')
        expect(result.hex).toEqual('020001e09f8421086295c6d78299a2d24e97a919275dd03b33dd0c0c7ccb78c4c405710100000001e72d286979ee6cb1b7e65dfddfb2e384100b8d148e7758de42e4168b71792c600e6e4601000000009a5de415a8276d2aee166d685c3afaeffb9d23ab014140875ac10facbab456170d1cf39a5a0708adb140f0e0415359b40a5a09efd85a0d56561f309ca4809447f5cbbf63b4ed83f7fbabc2906ee2d7c76af452392d7522232103cf9257d37f4ed524ba90a794fd96b958f3d7b3a4d2bb6baa11b120d15eade3d1ac')
    })

    it('should genrate signed message', async () => {
        const neo = new NEO()
        const pKSignProvider = SignProviderWithPrivateKey('2181be39a81f8fd84a785455bf44ff2f44582c5c03cd9e92a63cf026469f835e')
        const result = await neo.signMessage('636f626f', pKSignProvider)
        const testPublicKey = '03cf9257d37f4ed524ba90a794fd96b958f3d7b3a4d2bb6baa11b120d15eade3d1'

        const out = neo.verifyMessage(result, '636f626f', testPublicKey)
        expect(out).toBe(true)
    })

    describe('neo.utilis', () => {
        it('shoudld return right balance if the assets is empty', () => {
            const testNoneBalance = {
                address: 'Ax12384',
                balance: []
            }
            const emptyBalance = buildNeoBalance({ ...testNoneBalance, net: 'TestNet' })
            expect(emptyBalance.address).toEqual('Ax12384')
            expect(emptyBalance.assets).toEqual({})
            expect(emptyBalance.assetSymbols.length).toEqual(0)
        })

        it('should return the NEP 5 token balance if have', () => {
            const testTokenBalance =
                { "balance": [{ "unspent": [], "asset_symbol": "GAS", "asset_hash": "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7", "asset": "GAS", "amount": 0.0 }, { "unspent": [], "asset_symbol": "TKY", "asset_hash": "132947096727c84c7f9e076c90f08fec3bc17f18", "asset": "THEKEY Token", "amount": 206500.0 }], "address": "ANdRzFq5BCWL1kgVSmTEuEQEUyxrY8nbKH" }

            const tokeBalance = buildNeoBalance({ ...testTokenBalance, net: 'TestNet' })
            expect(tokeBalance.assetSymbols).toEqual(['GAS'])
            expect(tokeBalance.tokenSymbols).toEqual(['TKY'])
            expect(tokeBalance.tokens.TKY.toFixed()).toEqual('206500')
        })

        it('should return neo claims', () => {
            const testClaims = { "unclaimed": 0.2139291, "claimable": [{ "value": 990.0, "unclaimed": 0.2139291, "txid": "7105c4c478cb7c0c0cdd333bd05d2719a9974ed2a29982d7c695620821849fe0", "sys_fee": 0.068607, "start_height": 2879709, "n": 1, "generated": 0.1453221, "end_height": 2881806 }], "address": "AVr6BhSsy64hZqz4dFehX62o2UxsotXf2z" }
            const claim = buildNeoClaims(testClaims.address, 'TestNet', testClaims.claimable)
            expect(claim.claims.length).toEqual(1)
            expect(claim.claims[0].txid).toEqual('7105c4c478cb7c0c0cdd333bd05d2719a9974ed2a29982d7c695620821849fe0')
        })
    })
})