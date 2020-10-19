import {XRP} from '../../XRP';
import {signWithKeyPair, signWithKeyPairSync} from '../../XRP/signProvider';

const privateKey =
  '3C2D992B7C60792D421495525707A868F14D99361AE6A3A429501BEAC18378B4';
const signerPubkey =
  '0272DB8641A03008C27EBFBA2234C5BF93952C41FAE5A6295356CDC3991171EBE0';

describe('coin.XRP', () => {
  const xrp = new XRP();
  describe('address', () => {
    it('should derive correct XRP address', () => {
      const publicKey =
        '0272DB8641A03008C27EBFBA2234C5BF93952C41FAE5A6295356CDC3991171EBE0';
      expect(xrp.generateAddress(publicKey)).toBe(
        'rL5BYSLd89uzj4i4J47iLQg9HwmeXE7eCt',
      );
    });
    it('should check address validation', () => {
      expect(xrp.isAddressValid('r4Vtj2jrfmTVZGfSP3gH9hQPMqFPQFin8f')).toBe(
        true,
      );
      expect(xrp.isAddressValid('r4Vtj2jrfmTVZGfSP3gH9hQPMqFPQFin8')).toBe(
        false,
      );
    });
  });
  describe('transaction', () => {
    it('generateTransaction', async () => {
      const tx = await xrp.generateTransaction(
        {
          sequence: 1,
          fee: 20,
          changeAddress: 'rL5BYSLd89uzj4i4J47iLQg9HwmeXE7eCt',
          to: 'rHfof1xNbEtJYsXN8MUbnf9iFixCEY84kf',
          tag: 1700373364,
          amount: 1000000,
        },
        signWithKeyPair(
          privateKey,
          '0272DB8641A03008C27EBFBA2234C5BF93952C41FAE5A6295356CDC3991171EBE0',
        ),
      );
      expect(tx).toStrictEqual({
        txId:
          'B653C39FD5DE3249F466F4BA9937071536DD37828C8EF27B2096F3F17568D665',
        txHex:
          '120000228000000024000000012E6559A3746140000000000F424068400000000000001473210272DB8641A03008C27EBFBA2234C5BF93952C41FAE5A6295356CDC3991171EBE074463044022071CF4229E7296B07FA6F1287F67A02605D50A73DA607471DD3E7FF3A01D61EBB0220136220129E1DB50367B2DF2F219C79DCC1A5DA5169E1A3C85C8633727C7579378114D8343E8E1F27B467B651748B8396A52C9185D9F98314B0CB0194B32F22136D1FF5A01E45FB2FED2C3F75',
      });
    });
  });
  describe('transaction From Json', () => {
    it('generateTransactionFromJson', async () => {
      const tx = await xrp.generateTransactionFromJson(
          {
            Sequence: 1,
            Fee: "20",
            Account: 'rL5BYSLd89uzj4i4J47iLQg9HwmeXE7eCt',
            Destination: 'rHfof1xNbEtJYsXN8MUbnf9iFixCEY84kf',
            DestinationTag: 1700373364,
            Amount: '1000000',
            TransactionType: 'Payment',
            Flags: 2147483648,
          },
          signWithKeyPair(
              privateKey,
              '0272DB8641A03008C27EBFBA2234C5BF93952C41FAE5A6295356CDC3991171EBE0',
          ),
      );
      expect(tx).toStrictEqual({
        txId:
            'B653C39FD5DE3249F466F4BA9937071536DD37828C8EF27B2096F3F17568D665',
        txHex:
            '120000228000000024000000012E6559A3746140000000000F424068400000000000001473210272DB8641A03008C27EBFBA2234C5BF93952C41FAE5A6295356CDC3991171EBE074463044022071CF4229E7296B07FA6F1287F67A02605D50A73DA607471DD3E7FF3A01D61EBB0220136220129E1DB50367B2DF2F219C79DCC1A5DA5169E1A3C85C8633727C7579378114D8343E8E1F27B467B651748B8396A52C9185D9F98314B0CB0194B32F22136D1FF5A01E45FB2FED2C3F75',
      });
    });

    it('generateTransactionFromJsonSync', () => {
      const tx = xrp.generateTransactionFromJsonSync(
          {
            Sequence: 1,
            Fee: "20",
            Account: 'rL5BYSLd89uzj4i4J47iLQg9HwmeXE7eCt',
            Destination: 'rHfof1xNbEtJYsXN8MUbnf9iFixCEY84kf',
            DestinationTag: 1700373364,
            Amount: '1000000',
            TransactionType: 'Payment',
            Flags: 2147483648,
          },
          signWithKeyPairSync(
              privateKey,
              '0272DB8641A03008C27EBFBA2234C5BF93952C41FAE5A6295356CDC3991171EBE0',
          ),
      );
      expect(tx).toStrictEqual({
        txId:
            'B653C39FD5DE3249F466F4BA9937071536DD37828C8EF27B2096F3F17568D665',
        txHex:
            '120000228000000024000000012E6559A3746140000000000F424068400000000000001473210272DB8641A03008C27EBFBA2234C5BF93952C41FAE5A6295356CDC3991171EBE074463044022071CF4229E7296B07FA6F1287F67A02605D50A73DA607471DD3E7FF3A01D61EBB0220136220129E1DB50367B2DF2F219C79DCC1A5DA5169E1A3C85C8633727C7579378114D8343E8E1F27B467B651748B8396A52C9185D9F98314B0CB0194B32F22136D1FF5A01E45FB2FED2C3F75',
      });
    });

    it('generate "TrustSet" Transaction From Json', async () => {
      const text = '{"Account":"rL5BYSLd89uzj4i4J47iLQg9HwmeXE7eCt","Fee":"12","Flags":2147614720,"LimitAmount":{"currency":"USD","issuer":"rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq","value":"999999999"},"Sequence":14,"TransactionType":"TrustSet"}';
      var obj = JSON.parse(text);
      const tx = await xrp.generateTransactionFromJson(
          obj,
          signWithKeyPair(
              privateKey,
              signerPubkey,
          ),
      );
      expect(tx).toStrictEqual({
        txId:
            '707075C93BC4C49DDA410D311FFBA49BFDB6976DEFE3009F48D89A11F9561B27',
        txHex:
            '1200142280020000240000000E63D6A386F26F28698000000000000000000000000055534400000000002ADB0B3959D60A6E6991F729E1918B716392523068400000000000000C73210272DB8641A03008C27EBFBA2234C5BF93952C41FAE5A6295356CDC3991171EBE074473045022100DDAE9F6663834806C3FED7D93F837CA4D722DBE76BBEDBF9E2C9056C905C4FA002200D51F0842B0DC7241AEBF9DF5392E4ABAFD9E665B6F2A9707D47F5C865032B698114D8343E8E1F27B467B651748B8396A52C9185D9F9',
        });
    });

    it('generate "OfferCreate" Transaction From Json', async () => {
      const text = '{"Account":"rL5BYSLd89uzj4i4J47iLQg9HwmeXE7eCt","Fee":"12","Flags":2148139008,"Sequence":17,"TakerGets":"4065000","TakerPays":{"currency":"USD","issuer":"rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq","value":"0.970864"},"TransactionType":"OfferCreate"}'
      var obj = JSON.parse(text);
      const tx = await xrp.generateTransactionFromJson(
          obj,
          signWithKeyPair(
              privateKey,
              signerPubkey,
          ),
      );
      expect(tx).toStrictEqual({
        txId:
            '9B5D15A710B97573DD090454AD67C9F788A74E8930B13EA964D960810AFE4178',
        txHex:
            '12000722800A0000240000001164D4627DF4E673C00000000000000000000000000055534400000000002ADB0B3959D60A6E6991F729E1918B71639252306540000000003E06E868400000000000000C73210272DB8641A03008C27EBFBA2234C5BF93952C41FAE5A6295356CDC3991171EBE074473045022100CFA78160122E71FB91F5D592A95DAA16D601E88A94C252B7616CE2D4C7C1D7BA022027B60A58BFBB1BEF0B3B5C4925EA47F4E790D7F7C337E190D60E45DF38823C3C8114D8343E8E1F27B467B651748B8396A52C9185D9F9',
        });
    });

  });
});
