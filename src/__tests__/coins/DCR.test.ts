import { DCR } from "../../DCR";
import { TDCR } from "../../DCR/TDCR";
import signWithPrivateKey from "../../XZC/signProvider";

const privateKey =
  "5a6661e8354d612c5a045075c0fe758d87b6aa39e5e1d578f439c7300730e9bf";
const publicKey =
  "039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96";

const simpleUtxoWith1BTC = {
  address: "TshNG87SJsnofAvYd8F2wFYyQFi7SPCVQKG",
  txId: "f346bf2a074427367e9445a6f0f5297c47f11f4348e9c1c9154558eedaf217d2",
  outputIndex: 0,
  atoms: 4199813128
};

describe("coin.XZC", () => {
  const dcr = new DCR();
  const tdcr = new TDCR();

  it("should generate correct address", () => {
    const pubkey =
      "034bddcf8300468d2c3b7a4b7bc08d6338f4d584794cbc4ecec9bf2f46499d4fb9";
    expect(dcr.generateAddress(pubkey)).toBe(
      "Dsii6zYyV6ZK5ETU8VSnu3eGd7SHRzvb15K"
    );
    const pubkey2 =
      "039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96";
    expect(dcr.generateAddress(pubkey2)).toBe(
      "DshK38yvv5jhYpFBojcsngXhp9kBsjQ83mi"
    );
  });

  it("should generate testnet address", () => {
    const pubkey =
      "034bddcf8300468d2c3b7a4b7bc08d6338f4d584794cbc4ecec9bf2f46499d4fb9";
    expect(tdcr.generateAddress(pubkey)).toBe(
      "TsimKygUstcRBb8pwt4x3cfYDDQCzhqFdS7"
    );
    const pubkey2 =
      "039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96";
    expect(tdcr.generateAddress(pubkey2)).toBe(
      "TshNG87SJsnofAvYd8F2wFYyQFi7SPCVQKG"
    );
  });

  it("should valid a address", () => {
    const address = "Dsii6zYyV6ZK5ETU8VSnu3eGd7SHRzvb15K";
    expect(dcr.isAddressValid(address)).toBeTruthy();
  });

  it("should generate transaction raw hex that can be broadcast directly", async () => {
    const txHex = await tdcr.generateTransaction(
      {
        inputs: [simpleUtxoWith1BTC],
        changeAddress: "TshNG87SJsnofAvYd8F2wFYyQFi7SPCVQKG",
        amount: 100000,
        to: "TsimKygUstcRBb8pwt4x3cfYDDQCzhqFdS7",
        fee: 1000
      },
      signWithPrivateKey(privateKey),
      {
        publicKey
      }
    );
    expect(txHex).toStrictEqual({
      txHex:
        "0100000001d217f2daee584515c9c1e948431ff1477c29f5f0a645947e362744072abf46f30000000000ffffffff02a08601000000000000001976a914c2a5a04b38b78019a9afe000b36389831b1252fb88ac808552fa0000000000001976a914b350b72dcdc4371f72b236e9e192d7e1e69e967c88ac000000000000000001ffffffffffffffff00000000ffffffff6b483045022100f830991f461106675de8355b4f30b1f1ee108f5c518a807455e540a1f30066c3022056f03e36d236d222983228c67d578c2b2968037625b29950943c03a690a1c8540121039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96",
      txId: "b68fb47d2cefae90b5dc8ad41647053cb1206b660183c782905646c1d6b50e8e"
    });
  });

  it("should sign message", async () => {
    const message = "mmmmmmmmmmmm";
    const result = await dcr.signMessage(
      message,
      signWithPrivateKey(privateKey)
    );
    expect(result).toBe(
      "3045022100ff483094eb5f1422ff37c12825738cf403febf8ac1d99a6ce27e5270ba833c9e02205c2acf1e53ec622783d417d077003cc5d68cebb3bc29c57bcd142d6e44ee69b0"
    );
  });
});
