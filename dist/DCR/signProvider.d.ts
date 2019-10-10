import { Result } from "../Common/sign";
export declare const signWithPrivateKey: (privateKey: string) => {
    sign: (hex: string) => Promise<Result>;
};
export declare const signWithPrivateKeySync: (privateKey: string) => {
    sign: (hex: string) => Result;
};
