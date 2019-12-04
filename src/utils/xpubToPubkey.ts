import hdKey from 'hdkey';

enum SupportedCurves {
  secp256k1 = "secp256k1",
  secp256r1 = "secp256r1",
  ed25519 = "ed25519"
}

export default (
  xpub: string,
  index: number,
  curve: SupportedCurves = SupportedCurves.secp256k1
): Buffer => {
  switch (curve) {
    case SupportedCurves.secp256k1: {
      const accountPub = hdKey.fromExtendedKey(xpub);
      return accountPub.derive(`m/0/${index}`).publicKey;
    }
    default:
      throw new Error('curve not support yet');
  }
};
