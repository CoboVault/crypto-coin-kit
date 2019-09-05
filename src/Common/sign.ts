// import { Result } from "./coin";

export interface SignProvider {
  sign: (rawData: string) => Promise<any>; // should return Promise<Result> net version
  signMessage?: (hex: any) => any; // deprecated next version
}

export const sign = async (
  rawTx: string,
  signProvider: SignProvider
): Promise<any> => {
  return await signProvider.sign(rawTx);
};
