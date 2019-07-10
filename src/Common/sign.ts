export interface SignProvider {
  sign: (rawTx: string) => any;
}

export const sign = async <Result>(
  rawTx: string,
  signProvider: SignProvider
): Promise<Result> => {
  return await signProvider.sign(rawTx);
};
