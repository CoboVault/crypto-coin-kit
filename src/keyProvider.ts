import { Buffer } from "buffer";
// @ts-ignore
import secp256k1 from "secp256k1";
// @ts-ignore
import secp256r1 from "secp256r1";
import nacl from "tweetnacl";

export type KeyType = "secp256k1" | "secp256r1" | "ed25519";

export interface KeyProviderProps {
  privateKey?: Buffer;
  publicKey?: Buffer;
  keyType: KeyType;
}

export default class KeyProvider {
  private readonly privateKey?: Buffer;
  private readonly publicKey?: Buffer;
  private readonly keyType: KeyType;
  constructor(args: KeyProviderProps) {
    const { privateKey, publicKey, keyType } = args;
    if (!this.checkKeyType(keyType)) {
      throw new Error(`invalid key type: ${keyType}`);
    }
    if (privateKey && !this.checkPrivateKey(privateKey)) {
      throw new Error(`invalid privateKey, should be 32 bytes`);
    }
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.keyType = keyType;
  }

  public getPublicKey = () => {
    if (this.publicKey) {
      return this.publicKey;
    }
    switch (this.keyType) {
      case "ed25519":
        return this.ed25519GetPublicKey();
      case "secp256k1":
        return this.secp256k1GetPublicKey();
      case "secp256r1":
        return this.secp256r1GetPublicKey();
    }
  };

  private checkPrivateKey = (privateKey: Buffer) => {
    return privateKey.length >= 32;
  };

  private checkKeyType = (keyType: KeyType) => {
    return !(
      keyType !== "secp256k1" &&
      keyType !== "secp256r1" &&
      keyType !== "ed25519"
    );
  };

  private secp256k1GetPublicKey = () => {
    if (!this.privateKey) {
      throw new Error("No private key provided");
    }
    return secp256k1.publicKeyCreate(this.privateKey);
  };

  private secp256r1GetPublicKey = () => {
    if (!this.privateKey) {
      throw new Error("No private key provided");
    }
    return secp256r1.publicKeyCreate(this.privateKey);
  };

  private ed25519GetPublicKey = () => {
    if (!this.privateKey) {
      throw new Error("No private key provided");
    }
    const keyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(this.privateKey));
    return Buffer.from(keyPair.publicKey);
  };
}
