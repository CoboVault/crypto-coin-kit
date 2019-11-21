import { TxData } from "../../ETH";
import {
  signWithPrivateKey,
  signWithPrivateKeySync
} from "../../ETH/signProvider";
import {ETC} from "../../ETC";
import {addHexPrefix} from "ethereumjs-util";
import {Buffer} from "safe-buffer";
describe("coin.ETC", () => {
  const etc = new ETC();
  const testPrivKey =
    "4646464646464646464646464646464646464646464646464646464646464646";
  const data: TxData = {
    nonce: 9,
    gasPrice: "20000000000",
    gasLimit: "21000",
    to: "0x3535353535353535353535353535353535353535",
    value: "1000000000000000000",
    chainId: 61,
    memo:""
  };

  it("should generate right address", () => {
    const pubkey1 =
      "0x0237b0bb7a8288d38ed49a524b5dc98cff3eb5ca824c9f9dc0dfdb3d9cd600f299";
    const addr1 = "0x9858EfFD232B4033E47d90003D41EC34EcaEda94";
    expect(etc.generateAddress(pubkey1)).toBe(addr1);

    const pubkey2 =
      "0x039fd0991d0222b4e1339c1a1a5b5f6d9f6a96672a3247b638ee6156d9ea877a2f";
    const addr2 = "0x6Fac4D18c912343BF86fa7049364Dd4E424Ab9C0";
    expect(etc.generateAddress(pubkey2)).toBe(addr2);
  });

  it("should valid an address ", () => {
    [
      "0x52908400098527886E0F7030069857D2E4169EE7",
      "0x8617E340B3D01FA5F11F306F4090FD50E238070D",
      "0xde709f2102306220921060314715629080e2fb77",
      "0x27b1fdb04752bbc536007a920d24acb045561c26",
      "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
      "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
      "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
      "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb"
    ].forEach(s => expect(etc.isAddressValid(s, true)).toBeTruthy());

    [
      "0x52908400098527886E0F7030069857D2E4169EE7",
      "0x8617E340B3D01FA5F11F306F4090FD50E238070D",
      "0xde709f2102306220921060314715629080e2fb77",
      "0x27b1fdb04752bbc536007a920d24acb045561c26",
      "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
      "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
      "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
      "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb"
    ].forEach(s => expect(etc.isAddressValid(s)).toBeTruthy());
    expect(
      etc.isAddressValid("de709f2102306220921060314715629080e2fb77")
    ).toBeFalsy();
    expect(
      etc.isAddressValid("0xde709f2102306220921060314715629080e2fb")
    ).toBeFalsy();
    expect(
      etc.isAddressValid("0x52908400098527886E0F7030069857D2E4169EE6", true)
    ).toBeFalsy();
    expect(
      etc.isAddressValid("0x52908400098527886E0F7030069857D2E4169Ee7", true)
    ).toBeFalsy();
  });

  it("should sign a tx sync", () => {
    const { txId, txHex } = etc.generateTransactionSync(
      data,
      signWithPrivateKeySync(testPrivKey)
    );
    expect(txId).toBe(
      "0x1b535f2bf9325a3ed159a63c4781eb0c743514b9b5624bdecd14156f748481d5"
    );
    expect(txHex).toBe(
      "0xf86d098504a817c800825208943535353535353535353535353535353535353535880de0b6b3a764000080819ea09e59aa73a10ec8fe5a97fe7560806315624c1a67aeeb59310fdc0001ba2b38a0a08e648dc00e4bf3de3bdca34442553f3f4352f3f23585838d17cbed7d5f3cb81a"
    );
  });

  it("should sign a tx async", async () => {
    const { txId, txHex } = await etc.generateTransaction(
      data,
      signWithPrivateKey(testPrivKey)
    );
    expect(txId).toBe(
      "0x1b535f2bf9325a3ed159a63c4781eb0c743514b9b5624bdecd14156f748481d5"
    );
    expect(txHex).toBe(
      "0xf86d098504a817c800825208943535353535353535353535353535353535353535880de0b6b3a764000080819ea09e59aa73a10ec8fe5a97fe7560806315624c1a67aeeb59310fdc0001ba2b38a0a08e648dc00e4bf3de3bdca34442553f3f4352f3f23585838d17cbed7d5f3cb81a"
    );
  });

  it("should sign message sync", () => {
    const message = "hello world";
    const privkey =
      "1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727";
    const signedMessage = etc.signMessageSync(
      message,
      signWithPrivateKeySync(privkey)
    );
    expect(signedMessage).toBe(
      "0xae35d9375b015664a7b115a63a4515142b68059b164dd187e0b5232d47ca69685104d05d1c6c58b1fe5842f28459e2ea5bd571c0196f10da25fd2140eeef47e501"
    );
  });

  it("should sign message async", async () => {
    const message = "hello world";
    const privkey =
      "1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727";
    const signedMessage = await etc.signMessage(
      message,
      signWithPrivateKey(privkey)
    );
    expect(signedMessage).toBe(
      "0xae35d9375b015664a7b115a63a4515142b68059b164dd187e0b5232d47ca69685104d05d1c6c58b1fe5842f28459e2ea5bd571c0196f10da25fd2140eeef47e501"
    );
  });

  it('should format TxData to hex',  () => {
    const data1: TxData = {
      nonce: 152,
      gasPrice: "10000000000",
      gasLimit: "21000",
      to: "0x3535353535353535353535353535353535353535",
      value: "1000000000000000",
      memo: "",
      chainId: 61
    };

    const data2 = {
      nonce: '0x98',
      gasPrice: '0x2540be400',
      gasLimit: '0x5208',
      chainId: 61,
      to: '0x3535353535353535353535353535353535353535',
      value: '0x38d7ea4c68000',
      data: '0x' };
    expect(etc.formatTxData(data1)).toEqual(data2)
  });
});
