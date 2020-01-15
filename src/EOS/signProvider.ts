// @ts-ignore
import {Signature} from 'eosjs-ecc'
// @ts-ignore
import secp256k1 from "secp256k1";
// @ts-ignore
import wif from 'wif';
import {Result} from "../Common/sign";

export const SignProviderWithPrivateKey = (
    privateKey: string,// console.log('****rrr',res.toHex());
    // // console.log('****sss',res.s);
    // while (true) {
    //     console.log('sign',nonce);
    //     const sigObj = secp256k1.sign(input, privKey, {
    //         noncefn: () => {
    //             console.log(123, nonce)
    //             return nonce;
    //         }
    ) => {
        return {
            sign: async (hex: string): Promise<Result> => {
                try {
                    // const input = Buffer.from(hex, "hex");
                    const privKey = Buffer.from(privateKey, "hex");
                    const privKeyWif = wif.encode(128, privKey, false);
                    const res = Signature.signHash(hex, privKeyWif).toHex();
                    return {
                        r: res.slice(2, 66),
                        s: res.slice(66, 130),
                        recId: parseInt(res.slice(0, 2), 16) - 31
                    }
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            }
        };
    }
;

export const isCanonical = (c: Buffer) => {
    // https://steemit.com/steem/@dantheman/steem-and-bitshares-cryptographic-security-update
    //
    // EOSIO/eos public_key::is_canonical
    //
    return !(c[1] & 0x80)
        && !(c[1] === 0 && !(c[2] & 0x80))
        && !(c[33] & 0x80)
        && !(c[33] === 0 && !(c[34] & 0x80));
};
export const SignProviderWithPrivateKeySync = (
    privateKey: string,
) => {
    return {
        sign: (hex: string): Result => {
            try {
                const privKey = Buffer.from(privateKey, "hex");
                const privKeyWif = wif.encode(128, privKey, false);
                const res = Signature.signHash(hex, privKeyWif).toHex();
                return {
                    r: res.slice(2, 66),
                    s: res.slice(66, 130),
                    recId: parseInt(res.slice(0, 2), 16) - 31
                }
            } catch (e) {
                console.log(e);
                throw e;
            }
        }
    };
};

