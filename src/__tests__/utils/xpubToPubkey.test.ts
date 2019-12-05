import { xpubToPubkey } from "../../utils";
const xpub = 'xpub6CdY8gRERv1dWymvmE5GpgD11xRoMVXQJ2tVyFuqnL73JRC7ou9LZDpdTreGwsaqiWMGfiUsDqnFCP5MfamRNe7WmCtUqwwAgQGrJcdV9bh';
const pubkeyOfXpub = '03616fbacd92dee4cf373d2cf81b40a1e576cfb97450a7d3318c9b8039aa971d02';
const index = 15;
const pubkeyOfChild = '02709e6fd9e2e77167536d5bdd5464ac2dc00b63a16d2a96018e18c9ede8edc443';

describe("xpubToPubkey", () => {
  it("should generate corret pubkey", () => {
    expect(Buffer.from(xpubToPubkey(xpub, [0, index])).toString('hex')).toBe(pubkeyOfChild);
  });

  it("should generate unmatch pubkey", () => {
    expect(Buffer.from(xpubToPubkey(xpub, [0, index - 1])).toString('hex')).not.toBe(pubkeyOfChild);
  });

  it("should get pubkey of xpub while indexArr=[]", () => {
    expect(Buffer.from(xpubToPubkey(xpub, [])).toString('hex')).toBe(pubkeyOfXpub);
  });
});
