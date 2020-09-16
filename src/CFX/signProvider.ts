import {Result} from '../Common/sign';
const format = require('js-conflux-sdk/src/util/format');
// @ts-ignore
import {ecdsaSign} from 'js-conflux-sdk/src/util/sign';

export const SignProviderWithPrivateKey = (privateKey: string) => {
  return {
    sign: async (hex: string): Promise<Result> => {
      try {
        const input = format.buffer(hex);
        const privKey = format.buffer(privateKey);
        const {r, s, v} = ecdsaSign(input, privKey);
        return {
          r: format.hex(r),
          s: format.hex(s),
          recId: v,
        };
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
  };
};

export const SignProviderWithPrivateKeySync = (privateKey: string) => {
  return {
    sign: (hex: string): Result => {
      try {
        const input = format.buffer(hex);
        const privKey = format.buffer(privateKey);
        const {r, s, v} = ecdsaSign(input, privKey);
        return {
          r: format.hex(r),
          s: format.hex(s),
          recId: v,
        };
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
  };
};
