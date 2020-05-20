// ts-ignore
// @ts-ignore
import seck256k1 from 'secp256k1';

import {Result} from '../Common/coin';

export default (input: string): string => {
  if (input.length < 128) {
    throw new Error('not a valid signature');
  }
  const INPUT = input.toUpperCase();
  const r = INPUT.slice(0, 64);
  const s = INPUT.slice(64, 128);

  // DER https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki

  const signatureType = '30'; // compound
  const signatureLength = '44'; // 68 bytes = 0220(2) + r (32) + 0220(2) + s (32)
  const rsPrefix = '0220'; // 02 + 20 (R/S - length = 32 bytes)

  return `${signatureType}${signatureLength}${rsPrefix}${r}${rsPrefix}${s}`;
};

export const fromSignResultToDER = (result: Result): string => {
  const r = Buffer.from(result.r, 'hex');
  const s = Buffer.from(result.s, 'hex');
  const signature = Buffer.concat([r, s]);
  return seck256k1.signatureExport(signature).toString('hex');
};
