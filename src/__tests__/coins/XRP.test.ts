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
        "7cece68d2c7f8011959e768e58ca2b9680e2e2c8fd4c546c1b993351d32ab3f7"
      );
    });
  });
});
