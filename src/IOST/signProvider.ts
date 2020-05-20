import {eddsa} from 'elliptic';
import {Result} from '../Common/sign';

export const Ed25519KeyProvider = (privateKey: string, publicKey: string) => {
  return {
    publicKey,
    sign: async (hex: string): Promise<Result> => {
      try {
        const input = Buffer.from(hex, 'hex');
        const privKey = Buffer.from(privateKey, 'hex');
        const ed25519 = new eddsa('ed25519');
        const sigHex = ed25519.sign(input, privKey).toHex();
        return {
          r: sigHex.slice(0, 64),
          s: sigHex.slice(64, 128),
          recId: 0,
        };
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
  };
};

export const Ed25519KeyProviderSync = (
  privateKey: string,
  publicKey: string,
) => {
  return {
    publicKey,
    sign: (hex: string): Result => {
      try {
        const input = Buffer.from(hex, 'hex');
        const privKey = Buffer.from(privateKey, 'hex');
        const ed25519 = new eddsa('ed25519');
        const sigHex = ed25519.sign(input, privKey).toHex();
        return {
          r: sigHex.slice(0, 64),
          s: sigHex.slice(64, 128),
          recId: 0,
        };
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
  };
};
