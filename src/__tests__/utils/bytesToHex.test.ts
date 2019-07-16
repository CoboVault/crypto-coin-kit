import { Buffer } from 'buffer';
import { bytesToHex } from '../../utils';

describe('bytesToHex', () => {
    it('should convert bytes to hex string', () => {
        const bytesBuffer = Buffer.from("67a52903979c0fc874f2a557d3d095f49e7d02167c13149afadaa9249635deaf7756e43a4c0723a5b556876987b8a4810e7a5cfd0478d8089d9678696e409a0b00", 'hex');
        const bytes = Array.from(bytesBuffer);
        expect(
            bytesToHex(bytes)
        ).toBe("67a52903979c0fc874f2a557d3d095f49e7d02167c13149afadaa9249635deaf7756e43a4c0723a5b556876987b8a4810e7a5cfd0478d8089d9678696e409a0b00")
    })
})
