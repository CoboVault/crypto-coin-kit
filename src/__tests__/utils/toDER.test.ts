import { toDER } from '../../utils';

describe("toDER", () => {
   it('should throw error when signature length less than 128', () => {
       expect(()=>{
         toDER("AED");
       }).toThrow("not a valid signature")
   });
   it('should convert secp256 signature to DER format', () => {
       expect(toDER("67a52903979c0fc874f2a557d3d095f49e7d02167c13149afadaa9249635deaf7756e43a4c0723a5b556876987b8a4810e7a5cfd0478d8089d9678696e409a0b00"))
           .toBe("3044022067A52903979C0FC874F2A557D3D095F49E7D02167C13149AFADAA9249635DEAF02207756E43A4C0723A5B556876987B8A4810E7A5CFD0478D8089D9678696E409A0B")
   })
});
