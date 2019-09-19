// import { Result } from "./coin";

export interface Result {
  r: string;
  s: string;
  recId: number;
}
export interface SignProviderDeprecated {
  sign: (rawData: string) => Promise<any>; // should return Promise<Result> net version
  signMessage?: (hex: any) => any; // deprecated next version
}

export const sign = async (
  rawTx: string,
  signProvider: SignProviderDeprecated
): Promise<any> => {
  return await signProvider.sign(rawTx);
};

export interface SignProvider {
  sign: (hex: string) => Promise<Result>;
}

export interface SignProviderSync {
  sign: (hex: string) => Result;
}
