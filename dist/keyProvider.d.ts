/// <reference types="node" />
export declare type KeyType = "secp256k1" | "secp256r1" | "ed25519";
export interface KeyProviderProps {
    privateKey?: Buffer;
    publicKey?: Buffer;
    keyType: KeyType;
}
export default class KeyProvider {
    private readonly privateKey?;
    private readonly publicKey?;
    private readonly keyType;
    constructor(args: KeyProviderProps);
    getPublicKey: () => any;
    private checkPrivateKey;
    private checkKeyType;
    private secp256k1GetPublicKey;
    private secp256r1GetPublicKey;
    private ed25519GetPublicKey;
}
