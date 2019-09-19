// example sign provider for XZC

// @ts-ignore
import secp256k1 from "secp256k1";
import { Result } from "../Common/coin";

export default (privateKey: string) => {
  return {
    sign: async (hex: string): Promise<Result> => {
      try {
        const input = Buffer.from(hex, "hex");
        const privKey = Buffer.from(privateKey, "hex");
        const sigObj = secp256k1.sign(input, privKey);
        const r = sigObj.signature.slice(0, 32).toString("hex");
        const s = sigObj.signature.slice(32, 64).toString("hex");
        return {
          r,
          s
        };
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
  };
};
