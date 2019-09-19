export interface Result {
    r: string;
    s: string;
    recId: number;
}
export interface SignProviderDeprecated {
    sign: (rawData: string) => Promise<any>;
    signMessage?: (hex: any) => any;
}
export declare const sign: (rawTx: string, signProvider: SignProviderDeprecated) => Promise<any>;
export interface SignProvider {
    sign: (hex: string) => Promise<Result>;
}
export interface SignProviderSync {
    sign: (hex: string) => Result;
}
