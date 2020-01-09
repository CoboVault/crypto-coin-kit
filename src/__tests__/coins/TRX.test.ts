import {signWithPrivateKey} from "../../ETH/signProvider";
import {TRX, TxData} from "../../TRX";

const privKey = '89e76e48948a088d32208005b90c7795b418b74eb77323050391a9289bf9d293';
const pubKey = "03b2680ba21d4bd9771181f77e821816a2bd095e076dc28ff57ff12a74390de5f8";

const txData: TxData = {
    token: 'TRX',
    from: 'TTiYGxb7YNfUQJAnLFMd1pvmoywM7PxiG2',
    to: 'TXhtYr8nmgiSp3dY3cSfiKBjed3zN8teHS',
    value: 2000000,
    fee: 100000,
    latestBlock: {
        hash: '36f6939bb2fa89e8ec27b63954f5913d143d2fa18f9bd93ebcb57055ecb2057c',
        number: 16016988,
        timestamp: 1578306207000
    },
};
const txDataTRC10:TxData = {
    to: "TKCsXtfKfH2d6aEaQCctybDC9uaA3MSj2h",
    from: 'TXhtYr8nmgiSp3dY3cSfiKBjed3zN8teHS',
    value: 1,
    memo: "",
    fee: 100000,
    latestBlock: {
        hash: "6886a76fcae677e3543e546a43ad4e5fc6920653b56b713542e0bf64e0ff85ce",
        number: 16068126,
        timestamp: 1578459699000
    },
    token: "1001090",
    override: {
        tokenShortName: "TONE",
        tokenFullName: "TronOne",
        decimals: 0
    }
};

const txDataTRC20:TxData = {
    contractAddress:'TBAo7PNyKo94YWUq1Cs2LBFxkhTphnAE4T',
    to:'TQAg2T2vJcHAX9sbKTEoaoWzt512yUjiFD',
    from:'TUAhxw3MgMyR9rhyrMDnVJbo3bky1GSUrH',
    value:1000000,
    fee:1,
    latestBlock:{
        hash: '315f1ee0e082a1dae1b9de559665c6714f3b8667f69cd5e44466ba6e34d37aef',
        number: 1936,
        timestamp: 1527682440000
    }
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
    it('should generate signed tx', async () => {
        const tx = await trx.generateTransaction(txData, signWithPrivateKey(privKey));
        expect(tx.txHex).toBe('0a7e0a02665c2208ec27b63954f5913d40f8a198d3f72d5a67080112630a2d747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e73666572436f6e747261637412320a1541c2ac1d2a29ea27b9bbf049370c3505139c7c9d90121541ee6d1ffba872573971562a70f9ad1dc2d4af8c8b1880897a12411a1d35a2c6a114242a6ebf9e656c8606bf047c6f8cbafb983e7d2efc8adbee9678eb172e1b24668ca755c0eaf4e340b9ab158da2702d4b620d4c919d5cedbe9c01');
    });

    // curl -X POST --data '{"transaction":"0a8a010a022e1e2208543e546a43ad4e5f4098d6b09cf82d5a730802126f0a32747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e736665724173736574436f6e747261637412390a0731303031303930121541ee6d1ffba872573971562a70f9ad1dc2d4af8c8b1a1541654eb440c1a0640aca337ad9ebf3a122976a910520011241af78b81230901b89ca74506a9680b4ac1e533817a87e9cede87c597bbb97f5e4da9ab6438b1c7cbec762ab165d5e7c7f7f4f0fb97df23570ad4b047a0e67894b01"}' https://apilist.tronscan.org/api/broadcast
    // {"code":"SUCCESS","success":true,"message":"","transaction":""}
    // https://tronscan.org/#/transaction/07ceaad1c4145723392b36fe0ec3bea5fd2985583b6e93ef212f6063b08ea301
    it('should generate signed TRC10 token', async () => {
        const tx = await trx.generateTransaction(txDataTRC10, signWithPrivateKey('965cecde62f3c448a6bae0c3ce0c16267069eb0aae9f5390af8182eaee60bf47'));
        expect(tx.txHex).toBe('0a8a010a022e1e2208543e546a43ad4e5f4098d6b09cf82d5a730802126f0a32747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e736665724173736574436f6e747261637412390a0731303031303930121541ee6d1ffba872573971562a70f9ad1dc2d4af8c8b1a1541654eb440c1a0640aca337ad9ebf3a122976a910520011241af78b81230901b89ca74506a9680b4ac1e533817a87e9cede87c597bbb97f5e4da9ab6438b1c7cbec762ab165d5e7c7f7f4f0fb97df23570ad4b047a0e67894b01');
    });
    it('should generate signed TRC20 token', async () => {
        const tx = await trx.generateTransaction(txDataTRC20, signWithPrivateKey('986e593a779463e5d15fba95939f22d48736ccac90d4d451942cdc1047757f06'));
        expect(tx.txHex).toBe('0ad4010a0207902208e1b9de559665c67140a0def287bb2c5aae01081f12a9010a31747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e54726967676572536d617274436f6e747261637412740a1541c79f045e4d48ad8dae00e6a6714dae1e000adfcd1215410d292c98a5eca06c2085fff993996423cf66c93b2244a9059cbb0000000000000000000000009bbce520d984c3b95ad10cb4e32a9294e6338da300000000000000000000000000000000000000000000000000000000000f424070c0b6e087bb2c90018094ebdc031241df0f08440f3ca758d432e5566cc1a6f0260bbfbbd1f5bdeb583a4acdf8e10906125fa005dbe025d508cf2a2f946da177e63faf5253c0e3b097449f9f4259dfab00');
    });


    it('should sign message', async () => {
        expect(await trx.signMessage("hello", signWithPrivateKey(privKey)))
            .toBe('7f99c6d07404346ec0094a5790fe631c8145a3a6203708ef2d1b984c35eb38b2cc74a50273dc1007728fb49e1d2923f1684594e94abbd4ed1c77afdb45114b5600');
    });
});