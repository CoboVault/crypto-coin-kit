import { Result } from "../Common/sign";
declare const _default: (privateKey: string, publicKey: string) => {
    publicKey: string;
    sign: (hex: string) => Promise<Result>;
};
export default _default;
export declare const SignProviderWithPrivateKeySync: (privateKey: string, publicKey: string) => {
    publicKey: string;
    sign: (hex: string) => Result;
};
