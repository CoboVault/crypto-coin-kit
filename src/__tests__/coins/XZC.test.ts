import { XZC } from "../../XZC";
import { signWithPrivateKey, signWithPrivateKeySync } from "../../XZC/signProvider";
import { TXZC } from "../../XZC/TXZC";

const privateKey =
  "5a6661e8354d612c5a045075c0fe758d87b6aa39e5e1d578f439c7300730e9bf";
const signerPubkey =
  "039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96";

const simpleUtxoWith1BTC = {
  address: "TK6wo7WjENdYAKAcAeqWjudpMChmYDU6NZ",
  txId: "6491e2d390d8b08b5dcd9f0c11567acb94c1e9faddad459f6552822645eaa46b",
  outputIndex: 1,
  satoshis: 1e8
};

describe("coin.XZC", () => {
  const xzc = new XZC();
  const txzc = new TXZC();
  it("should throw error if supply invalid pubkey", () => {
    const pubkey = "034bddcf";
    expect(() => {
      xzc.generateAddress(pubkey);
    }).toThrow();
  });

  it("should generate correct address", () => {
    const pubkey =
      "034bddcf8300468d2c3b7a4b7bc08d6338f4d584794cbc4ecec9bf2f46499d4fb9";
    expect(xzc.generateAddress(pubkey)).toBe(
      "aJtu4Ztv64yCUZYm9YzQ7b3Hyrii2foaj8"
    );
    const pubkey2 =
      "039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96";
    expect(xzc.generateAddress(pubkey2)).toBe(
      "a9rCXxadJSWS4gY5anVvz3GC3n5oZeUrPY"
    );
  });

  it("should generate testnet address", () => {
    const pubkey =
      "034bddcf8300468d2c3b7a4b7bc08d6338f4d584794cbc4ecec9bf2f46499d4fb9";
    expect(txzc.generateAddress(pubkey)).toBe(
      "TU9eKiq2216JaCBHjRKysTQvHHLfyRiXjJ"
    );
    const pubkey2 =
      "039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96";
    expect(txzc.generateAddress(pubkey2)).toBe(
      "TK6wo7WjENdYAKAcAeqWjudpMChmYDU6NZ"
    );
  });

  it("should valid a address", () => {
    [
      'aJtu4Ztv64yCUZYm9YzQ7b3Hyrii2foaj8',
      'a9rCXxadJSWS4gY5anVvz3GC3n5oZeUrPY',
      'TU9eKiq2216JaCBHjRKysTQvHHLfyRiXjJ',
      'TK6wo7WjENdYAKAcAeqWjudpMChmYDU6NZ',
    ].forEach(item => expect(xzc.isAddressValid(item)).toBeTruthy());

    expect(xzc.isAddressValid('aJtu4Ztv64yCUZYm9YzQ7b3Hyrii2foaj7')).toBeFalsy();
  });

  it("should generate transaction raw hex that can be broadcast directly async", async () => {
    const txHex = await txzc.generateTransaction(
      {
        inputs: [simpleUtxoWith1BTC],
        changeAddress: "TK6wo7WjENdYAKAcAeqWjudpMChmYDU6NZ",
        amount: 100000,
        to: "TU9eKiq2216JaCBHjRKysTQvHHLfyRiXjJ",
        fee: 1000
      },
      signWithPrivateKey(privateKey),
      {
        signerPubkey
      }
    );
    expect(txHex).toStrictEqual({
      txHex:
        "01000000016ba4ea45268252659f45adddfae9c194cb7a56110c9fcd5d8bb0d890d3e29164010000006b483045022100cd18c0f115af46554fe1e0e1b26c7efdcf17ee3c85475830b51f102436637bf70220266aede380c24c5476220724fd0855cab975c5754465edb1aba5f79c7edb7f440121039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96ffffffff02a0860100000000001976a914c76b8fb00728567a92ba8ea5177bd702aa3ee64188ac7856f405000000001976a914642fc4360089fd8ae950eedee188c0f426d2cfb888ac00000000",
      txId: "44102fc7ff9025e2e94a4b9537bfa5e0f5265e0423b9cb994f83302d468e81a5"
    });
  });

  it("should generate transaction raw hex that can be broadcast directly sync", () => {
    const txHex = txzc.generateTransactionSync(
      {
        inputs: [simpleUtxoWith1BTC],
        changeAddress: "TK6wo7WjENdYAKAcAeqWjudpMChmYDU6NZ",
        amount: 100000,
        to: "TU9eKiq2216JaCBHjRKysTQvHHLfyRiXjJ",
        fee: 1000
      },
      signWithPrivateKeySync(privateKey),
      {
        signerPubkey
      }
    );
    expect(txHex).toStrictEqual({
      txHex:
        "01000000016ba4ea45268252659f45adddfae9c194cb7a56110c9fcd5d8bb0d890d3e29164010000006b483045022100cd18c0f115af46554fe1e0e1b26c7efdcf17ee3c85475830b51f102436637bf70220266aede380c24c5476220724fd0855cab975c5754465edb1aba5f79c7edb7f440121039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96ffffffff02a0860100000000001976a914c76b8fb00728567a92ba8ea5177bd702aa3ee64188ac7856f405000000001976a914642fc4360089fd8ae950eedee188c0f426d2cfb888ac00000000",
      txId: "44102fc7ff9025e2e94a4b9537bfa5e0f5265e0423b9cb994f83302d468e81a5"
    });
  });

  it("should sign message async", async () => {
    const message = "mmmmmmmmmmmm";
    const result = await xzc.signMessage(
      message,
      signWithPrivateKey(privateKey)
    );
    expect(result).toStrictEqual('ff483094eb5f1422ff37c12825738cf403febf8ac1d99a6ce27e5270ba833c9e5c2acf1e53ec622783d417d077003cc5d68cebb3bc29c57bcd142d6e44ee69b01');
  });

  it("should sign message sync", () => {
    const message = "mmmmmmmmmmmm";
    const result = xzc.signMessageSync(
      message,
      signWithPrivateKeySync(privateKey)
    );
    expect(result).toStrictEqual('ff483094eb5f1422ff37c12825738cf403febf8ac1d99a6ce27e5270ba833c9e5c2acf1e53ec622783d417d077003cc5d68cebb3bc29c57bcd142d6e44ee69b01');
  });
});
