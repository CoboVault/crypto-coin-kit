import { Result } from "../Common/sign";
export declare const signWithKeyPair: (privateKey: string, publicKey: string) => {
    publicKey: string;
    sign: (hex: string) => Promise<Result>;
};
export declare const signWithKeyPairSync: (privateKey: string, publicKey: string) => {
    publicKey: string;
    sign: (hex: string) => Result;
};
