import { KeyProvider } from "../keyProvider";

const data = {
  secp256k1: {
    privateKey:
      "5a6661e8354d612c5a045075c0fe758d87b6aa39e5e1d578f439c7300730e9bf",
    publicKey:
      "039f1ca2b5b17ef01d1e86111a79af62ba09f1d72a77cb4382e6ae0e76cf5aae96"
  },
  secp256r1: {
    privateKey:
      "c2072dd93386918d68ec187d70eeb026510e8d1500423d03e9a48d8128a72a67",
    publicKey:
      "03125ca286706e6238f5a029bb25d3feb3d0132688e2a33353cd998ec2b9956a41"
  },
  ed25519: {
    privateKey:
      "f4cd2c78fe871acff15bc4bb63a33cf9d394b3fdbf6366f30e9aa6ee39bacc4c",
    publicKey:
      "a1925077189537570b0daedd770f7ce3c07b095d5cddca09f9acd692504fd6b1"
  }
};

describe("Key Provider", () => {
  it("should not construct key provider if private key invalid", () => {
    expect(() => {
      const keyProvider = new KeyProvider({
        keyType: "secp256k1",
        privateKey: "111111"
      });
    }).toThrow("invalid privateKey: 111111, should be 32 byte hex");
  });
  describe("secp256k1", () => {
    const keyProvider = new KeyProvider({
      keyType: "secp256k1",
      privateKey: data.secp256k1.privateKey
    });
    it("should generate correct public key", () => {
      expect(keyProvider.getPublicKey()).toEqual(data.secp256k1.publicKey);
    });
  });
  describe("secp256r1", () => {
    const keyProvider = new KeyProvider({
      keyType: "secp256r1",
      privateKey: data.secp256r1.privateKey
    });
    it("should generate correct public key", () => {
      expect(keyProvider.getPublicKey()).toEqual(data.secp256r1.publicKey);
    });
  });
  describe("ed25519", () => {
    const keyProvider = new KeyProvider({
      keyType: "ed25519",
      privateKey: data.ed25519.privateKey
    });
    it("should generate correct public key", () => {
      expect(keyProvider.getPublicKey()).toEqual(data.ed25519.publicKey);
    });
  });
});
