import { createHash } from "crypto";

const sha256 = (data: Buffer) => {
  return createHash("sha256")
    .update(data)
    .digest();
};

export default (data: Buffer) => {
  return sha256(sha256(data));
};
