import {IOST} from "../../IOST";
import {Ed25519KeyProvider, Ed25519KeyProviderSync} from "../../IOST/signProvider";

const txData = {
    tokenName:'iost',
    from:'chendong99',
    to:'88_88_88_88',
    memo:'',
    amount:'1',
    timestamp :1579152770678
};

describe("Coin.IOST",()=>{
    const privKey = '632790825e1d1234b8a72a493ae08f3a8328c1faf5dfcbee2d838c6cc9f854ae';
    const pubKey = '36cbcb409c374786439aa6907a04e41dbc3402abc95c9234909cd21b0496c243';
    const iost = new IOST();
    it('should generate right address', () => {
        const iostPubKey = iost.generateAddress(pubKey);
        expect(iostPubKey).toBe('4guFd1weqq2Nvfxt6EDSfztUjp44trRzfJMqXumJ3qRt');
    });

    it('should valid pubKey', () => {
        const valid = iost.isAddressValid('4guFd1weqq2Nvfxt6EDSfztUjp44trRzfJMqXumJ3qRt');
        expect(valid).toBe(true);
    });

    // curl -X POST -H "Content-Type: text/plain" --data '{"gasRatio":1,"gasLimit":1000000,"actions":[{"contract":"token.iost","actionName":"transfer","data":"[\"iost\",\"chendong99\",\"88_88_88_88\",\"1\",\"\"]"}],"signers":[],"signatures":[],"publisher":"chendong99","publisher_sigs":[{"algorithm":"ED25519","public_key":"NsvLQJw3R4ZDmqaQegTkHbw0AqvJXJI0kJzSGwSWwkM=","signature":"K56HtN54ar3Lho4zYqnbpkhfVsF6YRXmZYqrLG4ZZCUBAP+gZOM8/Us7mhT/wjXBbQu/imdyU6TJ9u3/JHK7DA=="}],"amount_limit":[{"token":"iost","value":"1"}],"chain_id":1024,"reserved":null,"referredTx":"","time":1579152770678000000,"expiration":1579153070678000000,"delay":0}' http://api.iost.io/sendTx
    // https://www.iostabc.com/tx/C9UNh3VxaGM8xjnX5zMZvTYJ4y7djC4kDGCoqVdTZfCX
    it('should generate right tx',  async () => {
        // txData.timestamp = new Date().getTime();
        const tx = await iost.generateTransaction(txData, Ed25519KeyProvider(privKey,pubKey));
        expect(tx.txId).toBe('x5tJ8Q6vnsyaiPDdynKA5V3C1Xriz4GwLtEH1yqGubT');
    });

    // curl -X POST -H "Content-Type: text/plain" --data '{"gasRatio":1,"gasLimit":1000000,"actions":[{"contract":"token.iost","actionName":"transfer","data":"[\"iost\",\"chendong99\",\"88_88_88_88\",\"1\",\"\"]"}],"signers":[],"signatures":[],"publisher":"chendong99","publisher_sigs":[{"algorithm":"ED25519","public_key":"NsvLQJw3R4ZDmqaQegTkHbw0AqvJXJI0kJzSGwSWwkM=","signature":"K56HtN54ar3Lho4zYqnbpkhfVsF6YRXmZYqrLG4ZZCUBAP+gZOM8/Us7mhT/wjXBbQu/imdyU6TJ9u3/JHK7DA=="}],"amount_limit":[{"token":"iost","value":"1"}],"chain_id":1024,"reserved":null,"referredTx":"","time":1579152770678000000,"expiration":1579153070678000000,"delay":0}' http://api.iost.io/sendTx
    // https://www.iostabc.com/tx/C9UNh3VxaGM8xjnX5zMZvTYJ4y7djC4kDGCoqVdTZfCX
    it('should generate right tx sync',   () => {
        const tx = iost.generateTransactionSync(txData, Ed25519KeyProviderSync(privKey,pubKey));
    });

});
