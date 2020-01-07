import {signWithPrivateKey} from "../../ETH/signProvider";
import {TRX, TxData} from "../../TRX";

const privKey = '89e76e48948a088d32208005b90c7795b418b74eb77323050391a9289bf9d293';
const pubKey = "03b2680ba21d4bd9771181f77e821816a2bd095e076dc28ff57ff12a74390de5f8";

const txData:TxData = {
    token:'TRX',
    from:'TTiYGxb7YNfUQJAnLFMd1pvmoywM7PxiG2',
    to:'TXhtYr8nmgiSp3dY3cSfiKBjed3zN8teHS',
    value:2000000,
    fee: 100000,
    latestBlock:{
        hash:'36f6939bb2fa89e8ec27b63954f5913d143d2fa18f9bd93ebcb57055ecb2057c',
        number:16016988,
        timestamp:1578306207000
    },
};
describe("coin.TRX", () => {

    const trx = new TRX();
    it('should generate right address', () => {
        const address = trx.generateAddress(pubKey);
        expect(address).toBe("TTiYGxb7YNfUQJAnLFMd1pvmoywM7PxiG2")
    });

    it('should generate valid address', () => {
        expect(trx.isAddressValid('TTiYGxb7YNfUQJAnLFMd1pvmoywM7PxiG2')).toBe(true);
        expect(trx.isAddressValid('TTiYGxb7YNfUQJAnLFMd1pvmoywM7PxiGH')).toBe(false);
        expect(trx.isAddressValid('3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj')).toBe(false)
    });


    // curl -X POST --data '{"transaction":"0a7e0a02665c2208ec27b63954f5913d40f8a198d3f72d5a67080112630a2d747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e73666572436f6e747261637412320a1541c2ac1d2a29ea27b9bbf049370c3505139c7c9d90121541ee6d1ffba872573971562a70f9ad1dc2d4af8c8b1880897a12411a1d35a2c6a114242a6ebf9e656c8606bf047c6f8cbafb983e7d2efc8adbee9678eb172e1b24668ca755c0eaf4e340b9ab158da2702d4b620d4c919d5cedbe9c01"}' https://apilist.tronscan.org/api/broadcast
    // {"code":"SUCCESS","success":true,"message":"","transaction":""}
    // https://tronscan.org/#/transaction/9451437c0f306c0eaf73d54b9584aeaac6dc7d83672bfc192596bfed4f94a282
    it('should generate signed tx',  async () => {
        const tx = await trx.generateTransaction(txData,signWithPrivateKey(privKey));
        expect(tx.txHex).toBe('0a7e0a02665c2208ec27b63954f5913d40f8a198d3f72d5a67080112630a2d747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e73666572436f6e747261637412320a1541c2ac1d2a29ea27b9bbf049370c3505139c7c9d90121541ee6d1ffba872573971562a70f9ad1dc2d4af8c8b1880897a12411a1d35a2c6a114242a6ebf9e656c8606bf047c6f8cbafb983e7d2efc8adbee9678eb172e1b24668ca755c0eaf4e340b9ab158da2702d4b620d4c919d5cedbe9c01');
    });

    it('should sign message',  async () => {

        expect(await trx.signMessage("hello",signWithPrivateKey(privKey)))
            .toBe('7f99c6d07404346ec0094a5790fe631c8145a3a6203708ef2d1b984c35eb38b2cc74a50273dc1007728fb49e1d2923f1684594e94abbd4ed1c77afdb45114b5600');
    });
});