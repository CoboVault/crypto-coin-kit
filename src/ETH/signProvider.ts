import { ec } from "elliptic";
import { Result } from "../Common/sign";

export const signWithPrivateKey = (privateKey: string) => {
  return {
    sign: async (hex: string): Promise<Result> => {
      try {
        const input = Buffer.from(hex, "hex");
        const privKey = Buffer.from(privateKey, "hex");
        const secp256k1 = new ec("secp256k1").keyFromPrivate(privKey);

        const signObj = await secp256k1.sign(input);
        const r = signObj.r.toString("hex");
        const s = signObj.s.toString("hex");
        const recId = signObj.recoveryParam || 0;

        return {
          r,
          s,
          recId
        };
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
  };
};

export const signWithPrivateKeySync = (privateKey: string) => {
  return {
    sign: (hex: string): Result => {
      try {
        const input = Buffer.from(hex, "hex");
        const privKey = Buffer.from(privateKey, "hex");
        const secp256k1 = new ec("secp256k1").keyFromPrivate(privKey);

        const signObj = secp256k1.sign(input);
        const r = signObj.r.toString("hex");
        const s = signObj.s.toString("hex");
        const recId = signObj.recoveryParam || 0;

        return {
          r,
          s,
          recId
        };
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
  };
};
