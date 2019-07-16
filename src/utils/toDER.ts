export default (input: string): string => {
  if (input.length < 128) {
    throw new Error("not a valid signature");
  }
  const INPUT = input.toUpperCase();
  const r = INPUT.slice(0, 64);
  const s = INPUT.slice(64, 128);
  // DER https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki
  return `30440220${r}0220${s}`;
};
