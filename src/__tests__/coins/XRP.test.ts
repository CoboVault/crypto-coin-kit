// @ts-ignore
import binary from "ripple-binary-codec";
import { XRP } from "../../XRP";

describe("coin.XRP", () => {
  const xrp = new XRP();
  describe("address", () => {
    it("should derive correct XRP address", () => {
      const publicKey =
        "03294E766FD584C9538911828EE981C4A73DE0EAAD5AF08C377869C38477D2618F";
      expect(xrp.generateAddress(publicKey)).toBe(
        "rndm7RphBZG6CpZvKcG9AjoFbSvcKhwLCx"
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
    const txb = xrp.generateTxBuilder({
      transactionType: "Payment",
      sequence: 1,
      fee: "20",
      account: "rndm7RphBZG6CpZvKcG9AjoFbSvcKhwLCx",
      destination: "rGNXLMNHkUEtoo7qkCSHEm2sfMo8F969oZ",
      destinationTag: 1700373364,
      amount: "1000000",
      signingPubKey:
        "03294E766FD584C9538911828EE981C4A73DE0EAAD5AF08C377869C38477D2618F"
    });

    it("should generate transaction", () => {
      expect(txb.getUnsignedTx()).toBe(
        "e64bfa14325fe8ca00c73a250c98b24482fc6a7a3b996fa245da339301071cd5"
      );
    });
    it("should add signature and generate signed tx", () => {
      txb.addSignature(
        "67a52903979c0fc874f2a557d3d095f49e7d02167c13149afadaa9249635deaf7756e43a4c0723a5b556876987b8a4810e7a5cfd0478d8089d9678696e409a0b00"
      );
      expect(txb.getSignedTx()).toStrictEqual({
        id: "8EDF6F2EB7A8627DB5D100E81C65B73C6EA213736B890C76498AB4FB6B3057E6",
        txBlob:
          "120000228000000024000000012E6559A3746140000000000F4240684000000000000014732103294E766FD584C9538911828EE981C4A73DE0EAAD5AF08C377869C38477D2618F74463044022067A52903979C0FC874F2A557D3D095F49E7D02167C13149AFADAA9249635DEAF02207756E43A4C0723A5B556876987B8A4810E7A5CFD0478D8089D9678696E409A0B811432D49A06A7BD5ED01DD0989E783D441D15E798888314A7189D8FAF853122B26CF360DD701CD9E66D6B83"
      });
    });
    it("should throw error when call getUnsignedTx after signed", () => {
      txb.addSignature("67a52903979c0fc874f2a557d3d095f49e7d02167c13149afadaa9249635deaf7756e43a4c0723a5b556876987b8a4810e7a5cfd0478d8089d9678696e409a0b00");
      expect(()=>{
        txb.getUnsignedTx()
      }).toThrow("can not encode a signed tx")
    })
  });
});
