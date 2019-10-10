import { createHash } from "crypto";
// @ts-ignore
import cryptoB from "crypto-browserify";

export const sha256 = (data: Buffer) => {
  return createHash("sha256")
    .update(data)
    .digest();
};

export const blake256 = (data: Buffer) => {
  return cryptoB
    .createHash("blake256")
    .update(data)
    .digest();
};

export default (data: Buffer) => {
  return sha256(sha256(data));
};

export const doubleBlake256 = (data: Buffer) => {
  return blake256(blake256(data));
};
