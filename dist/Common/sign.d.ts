export interface SignProvider {
    sign: (rawTx: string) => any;
}
export declare const sign: <Result>(rawTx: string, signProvider: SignProvider) => Promise<Result>;
