import {XRP} from '../../XRP';
import {signWithKeyPair} from '../../XRP/signProvider';

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
});
