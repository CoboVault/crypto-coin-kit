declare module 'hdkey' {
  class HDNode {
    public static fromMasterSeed(seed: Buffer): HDNode;
    public static fromExtendedKey(extendedKey: string): HDNode;
    public static fromJSON(obj: {xpriv: string; xpub: string}): HDNode;
    public publicExtendedKey: string;
    public publicKey: Buffer;
    public privateKey: Buffer;
    public chainCode: Buffer;
    private constructor();
    public derive(path: string): HDNode;
    public toJSON(): {xpriv: string; xpub: string};
  }
  export = HDNode;
}
