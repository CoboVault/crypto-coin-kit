// @ts-ignore
import { XRP } from "../../XRP";

describe("coin.XRP", () => {
  const xrp = new XRP();
  describe("address", () => {
    it("should derive correct XRP address", () => {
      const publicKey =
        "038AAE247B2344B1837FBED8F57389C8C11774510A3F7D784F2A09F0CB6843236C";
      expect(xrp.generateAddress(publicKey)).toBe(
        "r4Vtj2jrfmTVZGfSP3gH9hQPMqFPQFin8f"
      );
    });
    it("should check address validation", () => {
      expect(xrp.isAddressValid("r4Vtj2jrfmTVZGfSP3gH9hQPMqFPQFin8f")).toBe(
        true
      );
      expect(xrp.isAddressValid("r4Vtj2jrfmTVZGfSP3gH9hQPMqFPQFin8")).toBe(
        false
      );
    });
  });
  describe("transaction", () => {
    it("should generate transaction", () => {
      expect(
        xrp.generateUnsignedTransaction({
          transactionType: "Payment",
          sequence: 2,
          fee: "12",
          account: "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
          destination: "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
          amount: "1"
        })
      ).toBe(
        "535458001200002280000000240000000261400000000000000168400000000000000C81144B4E9C06F24296074F7BC48F92A97916C6DC5EA983143E9D4A2B8AA0780F682D136F7A56D6724EF53754"
      );
    });
  });
});
