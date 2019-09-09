export interface SignProvider {
    sign: (rawData: string) => Promise<any>;
    signMessage?: (hex: any) => any;
}
export declare const sign: (rawTx: string, signProvider: SignProvider) => Promise<any>;
