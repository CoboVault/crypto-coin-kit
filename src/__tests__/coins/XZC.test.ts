import { XZC } from "../../XZC";
import signWithPrivateKey from "../../XZC/signProvider";

// @ts-ignore
import { magicHash } from "bitcoinjs-message";
import { hash256, reverseBuffer } from "../../utils";

const privateKey =
  "5a6661e8354d612c5a045075c0fe758d87b6aa39e5e1d578f439c7300730e9bf";
const publicKey =
  "039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96";

const simpleUtxoWith1BTC = {
  address: "TK6wo7WjENdYAKAcAeqWjudpMChmYDU6NZ",
  txId: "6491e2d390d8b08b5dcd9f0c11567acb94c1e9faddad459f6552822645eaa46b",
  outputIndex: 1,
  satoshis: 1e8
};

describe("coin.XZC", () => {
  const xzc = new XZC();
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
    expect(xzc.generateAddress(pubkey, "testnet")).toBe(
      "TU9eKiq2216JaCBHjRKysTQvHHLfyRiXjJ"
    );
    const pubkey2 =
      "039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96";
    expect(xzc.generateAddress(pubkey2, "testnet")).toBe(
      "TK6wo7WjENdYAKAcAeqWjudpMChmYDU6NZ"
    );
  });

  it("should valid a address", () => {
    const address = "aJtu4Ztv64yCUZYm9YzQ7b3Hyrii2foaj8";
    expect(xzc.isAddressValid(address)).toBeTruthy();
  });

  it("should generate transaction raw hex that can be broadcast directly", async () => {
    const txHex = await xzc.generateTransaction(
      {
        inputs: [simpleUtxoWith1BTC],
        changeAddress: "TK6wo7WjENdYAKAcAeqWjudpMChmYDU6NZ",
        amount: 100000,
        to: "TU9eKiq2216JaCBHjRKysTQvHHLfyRiXjJ",
        fee: 1000
      },
      signWithPrivateKey(privateKey),
      {
        publicKey
      }
    );
    expect(txHex).toStrictEqual({
      txHex:
        "01000000016ba4ea45268252659f45adddfae9c194cb7a56110c9fcd5d8bb0d890d3e29164010000006b483045022100cd18c0f115af46554fe1e0e1b26c7efdcf17ee3c85475830b51f102436637bf70220266aede380c24c5476220724fd0855cab975c5754465edb1aba5f79c7edb7f440121039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96ffffffff02a0860100000000001976a914c76b8fb00728567a92ba8ea5177bd702aa3ee64188ac7856f405000000001976a914642fc4360089fd8ae950eedee188c0f426d2cfb888ac00000000",
      txId: "44102fc7ff9025e2e94a4b9537bfa5e0f5265e0423b9cb994f83302d468e81a5"
    });
  });

  it("should sign message", async () => {
    const message = "mmmmmmmmmmmm";
    const result = await xzc.signMessage(
      message,
      signWithPrivateKey(privateKey)
    );
    expect(result).toBe(
      "304402200214bde1a652527b60becff51c79b42446fb5ac9545413701ad0365d53d5f84a0220029c76311a6898919996d74ea8931b2ba1a4e9fafeff768f1a9d9f7e8cee4da3"
    );
  });
});
