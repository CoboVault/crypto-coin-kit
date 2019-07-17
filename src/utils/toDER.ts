export default (input: string): string => {
  if (input.length < 128) {
    throw new Error("not a valid signature");
  }
  const INPUT = input.toUpperCase();
  const r = INPUT.slice(0, 64);
  const s = INPUT.slice(64, 128);

  // DER https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki

  const signatureType = "30"; // compound
  const signatureLength = "44"; // 68 bytes = 0220(2) + r (32) + 0220(2) + s (32)
  const rsPrefix = "0220"; // 02 + 20 (R/S - length = 32 bytes)

  return `${signatureType}${signatureLength}${rsPrefix}${r}${rsPrefix}${s}`;
};
