import NEO from '../../NEO'

describe('coin.NEO', () => {
    it('should get right address when generate the address', () => {
        const testPublicKey = '03cf9257d37f4ed524ba90a794fd96b958f3d7b3a4d2bb6baa11b120d15eade3d1'
        const address = new NEO().generateAddress(testPublicKey)
        expect(address).toEqual("AVr6BhSsy64hZqz4dFehX62o2UxsotXf2z")  
    })
})