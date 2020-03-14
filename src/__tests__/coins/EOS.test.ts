import {EOS, TxData} from "../../EOS";
import {SignProviderWithPrivateKey, SignProviderWithPrivateKeySync} from "../../EOS/signProvider";

const privKey = '2fa110edcefe9d64ccaece846245cebbe46893f16f4d22e68ef49a7c8b6e4874';
const pubKey = '03c218e7c1dc1749d161af204334acffa9d384337a37f92cf03502a33a64fe3789';

const txData:TxData = {
    type:"transfer",
    data:{
        from:"cobowalletcn",
        to:"cobotestbibi",
        amount:10000,
        memo:'',
        fee:0,
        decimal: 4,
    },
    header:{
        time: 1580807523825,
        refBlockNum:103404960,
        refBlockPrefix:508621698,
        expireInSeconds:300
    }
};

const nutTxData:TxData = {
    type:"transfer",
    data:{
        from:"cobowalletcn",
        to:"cobotestbibi",
        amount:10000,
        memo:'',
        fee:0,
        symbol: 'NUT',
        decimal: 9,
    },
    header:{
        time: 1584104759699,
        refBlockNum:109920658,
        refBlockPrefix:192835320,
        expireInSeconds:300
    },
    tokenAccount: 'eosdtnutoken'

};
describe("Coin.EOS",()=>{
    const eos = new EOS();
    it('should generate right dress',  () => {
        const address = eos.generateAddress(pubKey);
        expect(address).toBe('EOS8JiV4sKPmMPoTCrGV8dhm4foKSBRdnyRw3FWzf6mQz6H8KXNMR');
    });

    it('should valid address',  () => {
        expect(eos.isAddressValid('EOS86B1XBB2B7u3QcdM5tuuTdRMLFfVDzsTcjHvDqcFq78MSstUxp'))
            .toBe(true);
    });

    //  curl -X POST --url https://api.eosnewyork.io/v1/chain/push_transaction -d '{"compression":"none","transaction":{"expiration":"2020-02-04T09:17:03","ref_block_num":54688,"ref_block_prefix":508621698,"max_net_usage_words":0,"max_cpu_usage_ms":0,"delay_sec":0,"context_free_actions":[],"actions":[{"account":"eosio.token","name":"transfer","authorization":[{"actor":"cobowalletcn","permission":"active"}],"data":"305156311a4e0f45e08e3b19ab4c0f45102700000000000004454f530000000000"}],"transaction_extensions":[]},"signatures":["SIG_K1_JxRVz8WGEeaJtdy27UmqT68E2pVB62u1hBBL98xL2Cn4kmpQ7DeGNkjtzhzCFmt7Tn7SYfRJnnCRcyny4rLCGkenAZgPDD"]}'
    // https://bloks.io/transaction/7af10fb78976604e080b0fe34c523e5ec722b800f4a9b1af350d6238039560dd
    it('should generate tx',async () => {
        const eosTx = await eos.generateTransaction(txData,SignProviderWithPrivateKey(privKey));
        expect(eosTx.txId).toBe('7af10fb78976604e080b0fe34c523e5ec722b800f4a9b1af350d6238039560dd');
        const tx = JSON.parse(eosTx.txHex);
        expect(tx.signatures[0])
            .toBe('SIG_K1_Kf8yNx2UXUgqxuCMWzaune51QEE7BPungQiVcKx8dKtfhVPkc5SCjB4fPrUbqi2avEzioG6da3NR19j77dG3wmGaX3ssNS')
    });

    //  curl -X POST --url https://api.eosnewyork.io/v1/chain/push_transaction -d '{"compression":"none","transaction":{"expiration":"2020-02-04T09:17:03","ref_block_num":54688,"ref_block_prefix":508621698,"max_net_usage_words":0,"max_cpu_usage_ms":0,"delay_sec":0,"context_free_actions":[],"actions":[{"account":"eosio.token","name":"transfer","authorization":[{"actor":"cobowalletcn","permission":"active"}],"data":"305156311a4e0f45e08e3b19ab4c0f45102700000000000004454f530000000000"}],"transaction_extensions":[]},"signatures":["SIG_K1_JxRVz8WGEeaJtdy27UmqT68E2pVB62u1hBBL98xL2Cn4kmpQ7DeGNkjtzhzCFmt7Tn7SYfRJnnCRcyny4rLCGkenAZgPDD"]}'
    // https://bloks.io/transaction/7af10fb78976604e080b0fe34c523e5ec722b800f4a9b1af350d6238039560dd
    it('should generate tx sync',   () => {
        const eosTx = eos.generateTransactionSync(txData,SignProviderWithPrivateKeySync(privKey));
        expect(eosTx.txId).toBe('7af10fb78976604e080b0fe34c523e5ec722b800f4a9b1af350d6238039560dd');
        const tx = JSON.parse(eosTx.txHex);
        expect(tx.signatures[0])
            .toBe('SIG_K1_Kf8yNx2UXUgqxuCMWzaune51QEE7BPungQiVcKx8dKtfhVPkc5SCjB4fPrUbqi2avEzioG6da3NR19j77dG3wmGaX3ssNS')
    });

    it('should generate nut token tx',async () => {
        const eosTx = await eos.generateTransaction(nutTxData,SignProviderWithPrivateKey(privKey));
        expect(eosTx.txId).toBe('350849c86f988659a83a0509d02a37a729feb10eb1f16c3e84f25d691f4a49b9');
        const tx = JSON.parse(eosTx.txHex);
        expect(tx.signatures[0])
            .toBe('SIG_K1_JvuGPLCqxJWjoULXVVftEZJ8BT5VWkjh4o1RgpeFegRMiMG25akDHn8TNoPZ6VPTzwSz3iEeJ7k4QaCLBK6ERE9oJAHprR')
    });

    //  curl -X POST --url https://api.eosnewyork.io/v1/chain/push_transaction -d '{"compression":"none","transaction":{"expiration":"2020-02-04T09:17:03","ref_block_num":54688,"ref_block_prefix":508621698,"max_net_usage_words":0,"max_cpu_usage_ms":0,"delay_sec":0,"context_free_actions":[],"actions":[{"account":"eosio.token","name":"transfer","authorization":[{"actor":"cobowalletcn","permission":"active"}],"data":"305156311a4e0f45e08e3b19ab4c0f45102700000000000004454f530000000000"}],"transaction_extensions":[]},"signatures":["SIG_K1_JxRVz8WGEeaJtdy27UmqT68E2pVB62u1hBBL98xL2Cn4kmpQ7DeGNkjtzhzCFmt7Tn7SYfRJnnCRcyny4rLCGkenAZgPDD"]}'
    // https://bloks.io/transaction/7af10fb78976604e080b0fe34c523e5ec722b800f4a9b1af350d6238039560dd
    it('should generate nut token tx sync',   () => {
        const eosTx = eos.generateTransactionSync(nutTxData,SignProviderWithPrivateKeySync(privKey));
        expect(eosTx.txId).toBe('350849c86f988659a83a0509d02a37a729feb10eb1f16c3e84f25d691f4a49b9');
        const tx = JSON.parse(eosTx.txHex);
        expect(tx.signatures[0])
            .toBe('SIG_K1_JvuGPLCqxJWjoULXVVftEZJ8BT5VWkjh4o1RgpeFegRMiMG25akDHn8TNoPZ6VPTzwSz3iEeJ7k4QaCLBK6ERE9oJAHprR')
    });
});
