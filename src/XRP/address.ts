// @ts-ignore
import { isValidAddress } from "ripple-address-codec";
// @ts-ignore
import { deriveAddress } from "ripple-keypairs";

export const derive = (publicKey: string) => {
  return deriveAddress(publicKey);
};

export const isValid = (address: string) => {
  return isValidAddress(address);
};
