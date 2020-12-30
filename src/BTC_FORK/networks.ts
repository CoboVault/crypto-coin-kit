export interface Network {
  coin?: string;
  messagePrefix: string;
  bech32: string;
  bip32: Bip32;
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
  forkId?: number;
}

interface Bip32 {
  public: number;
  private: number;
}

export const bitcoin: Network = {
  coin: 'bitcoin',
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'bc',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
};
export const regtest: Network = {
  coin: 'bitcoin_regtest',
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'bcrt',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};
export const testnet: Network = {
  coin: 'bitcoin_testnet',
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

export const bitcoincash: Network = {
  coin: 'bitcoincash',
  messagePrefix: '\x18Bitcoin Cash Signed Message:\n',
  bech32: '',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 0x80,
  forkId: 0x00,
};
// tslint:disable-next-line:variable-name
export const bitcoincash_testnet: Network = {
  coin: 'bitcoincash_testnet',
  messagePrefix: '\x18Bitcoin Cash Signed Message:\n',
  bech32: '',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
  forkId: 0x00,
};
export const bitcoingold: Network = {
  coin: 'bitcoingold',
  messagePrefix: '\x18Bitcoin Gold Signed Message:\n',
  bech32: '',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x26,
  scriptHash: 0x17,
  wif: 0x80,
  forkId: 0x4f,
};
export const litecoin: Network = {
  coin: 'litecoin',
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bech32: '',
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe,
  },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0xb0,
};

export const dash: Network = {
  coin: 'dash',
  messagePrefix: '\x18DASH Signed Message:\n',
  bech32: '',
  bip32: {
    public: 0x02fe52cc,
    private: 0x02fe52f8,
  },
  pubKeyHash: 0x4c,
  scriptHash: 0x10,
  wif: 0xcc,
};
