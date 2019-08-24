export interface SignProvider {
    sign: (rawTx: string) => any;
    signMessage: (hex: string) => string;
}
export declare const sign: <Result>(rawTx: string, signProvider: SignProvider) => Promise<Result>;
