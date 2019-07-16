import { Buffer } from "buffer";
// @ts-ignore
import secp256k1 from "secp256k1";
// @ts-ignore
import secp256r1 from "secp256r1";
import nacl from "tweetnacl";
import { bytesToHex } from "./utils";

export type KeyType = "secp256k1" | "secp256r1" | "ed25519";

export interface KeyProviderProps {
  privateKey?: string;
  publicKey?: string;
  keyType: KeyType;
}

export class KeyProvider {
  private readonly privateKey?: string;
  private readonly publicKey?: string;
  private readonly keyType: KeyType;
  constructor(args: KeyProviderProps) {
    const { privateKey, publicKey, keyType } = args;
    if (!this.checkKeyType(keyType)) {
      throw new Error(`invalid key type: ${keyType}`);
    }
    if (privateKey && !this.checkPrivateKey(privateKey)) {
      throw new Error(
        `invalid privateKey: ${privateKey}, should be 32 byte hex`
      );
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

  private checkPrivateKey = (privateKey: string) => {
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
    const privateKeyData = Buffer.from(this.privateKey, "hex");
    const publicKeyData = secp256k1.publicKeyCreate(privateKeyData);
    return publicKeyData.toString("hex");
  };

  private secp256r1GetPublicKey = () => {
    if (!this.privateKey) {
      throw new Error("No private key provided");
    }
    const privateKeyData = Buffer.from(this.privateKey, "hex");
    const publicKeyData = secp256r1.publicKeyCreate(privateKeyData);
    return publicKeyData.toString("hex");
  };

  private ed25519GetPublicKey = () => {
    if (!this.privateKey) {
      throw new Error("No private key provided");
    }
    const privateKeyData = Buffer.from(this.privateKey, "hex");
    const keyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(privateKeyData));
    const publicKeyData = Array.from(keyPair.publicKey);
    return bytesToHex(publicKeyData);
  };
}
