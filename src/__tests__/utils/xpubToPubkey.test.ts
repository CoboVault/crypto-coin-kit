import { xpubToPubkey } from "../../utils";
const xpub = 'xpub6CdY8gRERv1dWymvmE5GpgD11xRoMVXQJ2tVyFuqnL73JRC7ou9LZDpdTreGwsaqiWMGfiUsDqnFCP5MfamRNe7WmCtUqwwAgQGrJcdV9bh';
const index = 15;
const pubkey = '02709e6fd9e2e77167536d5bdd5464ac2dc00b63a16d2a96018e18c9ede8edc443';

describe("xpubToPubkey", () => {
  it("should generate corret pubkey", () => {
    expect(Buffer.from(xpubToPubkey(xpub, [0, index])).toString('hex')).toBe(pubkey);
  });

  it("should generate unmatch pubkey", () => {
    expect(Buffer.from(xpubToPubkey(xpub, [0, index - 1])).toString('hex')).not.toBe(pubkey);
  });
});
