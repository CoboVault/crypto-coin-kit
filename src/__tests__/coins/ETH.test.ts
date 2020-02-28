import { ETH, TxData } from "../../ETH";
import {
  SignProviderWithPrivateKey,
  SignProviderWithPrivateKeySync
} from "../../ETH/signProvider";

describe("coin.ETH", () => {
  const eth = new ETH(1);
  const testPrivKey =
    "4646464646464646464646464646464646464646464646464646464646464646";
  const data: TxData = {
    nonce: 9,
    gasPrice: "20000000000",
    gasLimit: "21000",
    to: "0x3535353535353535353535353535353535353535",
    value: "1000000000000000000",
    memo: "",
  };

  it("should generate right address", () => {
    const pubkey1 =
      "0x0237b0bb7a8288d38ed49a524b5dc98cff3eb5ca824c9f9dc0dfdb3d9cd600f299";
    const addr1 = "0x9858EfFD232B4033E47d90003D41EC34EcaEda94";
    expect(eth.generateAddress(pubkey1)).toBe(addr1);

    const pubkey2 =
      "0x039fd0991d0222b4e1339c1a1a5b5f6d9f6a96672a3247b638ee6156d9ea877a2f";
    const addr2 = "0x6Fac4D18c912343BF86fa7049364Dd4E424Ab9C0";
    expect(eth.generateAddress(pubkey2)).toBe(addr2);
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
    ].forEach(s => expect(eth.isAddressValid(s, true)).toBeTruthy());

    [
      "0x52908400098527886E0F7030069857D2E4169EE7",
      "0x8617E340B3D01FA5F11F306F4090FD50E238070D",
      "0xde709f2102306220921060314715629080e2fb77",
      "0x27b1fdb04752bbc536007a920d24acb045561c26",
      "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
      "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
      "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
      "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb"
    ].forEach(s => expect(eth.isAddressValid(s)).toBeTruthy());
    expect(
      eth.isAddressValid("de709f2102306220921060314715629080e2fb77")
    ).toBeFalsy();
    expect(
      eth.isAddressValid("0xde709f2102306220921060314715629080e2fb")
    ).toBeFalsy();
    expect(
      eth.isAddressValid("0x52908400098527886E0F7030069857D2E4169EE6", true)
    ).toBeFalsy();
    expect(
      eth.isAddressValid("0x52908400098527886E0F7030069857D2E4169Ee7", true)
    ).toBeFalsy();
  });

  it("should sign a tx sync", () => {
    const { txId, txHex } = eth.generateTransactionSync(
      data,
        SignProviderWithPrivateKeySync(testPrivKey)
    );
    expect(txId).toBe(
      "0x33469b22e9f636356c4160a87eb19df52b7412e8eac32a4a55ffe88ea8350788"
    );
    expect(txHex).toBe(
      "0xf86c098504a817c800825208943535353535353535353535353535353535353535880de0b6b3a76400008025a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761aecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83"
    );
  });

  it("should sign a tx async", async () => {
    const { txId, txHex } = await eth.generateTransaction(
      data,
        SignProviderWithPrivateKey(testPrivKey)
    );
    expect(txId).toBe(
      "0x33469b22e9f636356c4160a87eb19df52b7412e8eac32a4a55ffe88ea8350788"
    );
    expect(txHex).toBe(
      "0xf86c098504a817c800825208943535353535353535353535353535353535353535880de0b6b3a76400008025a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761aecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83"
    );
  });

  // https://etherscan.io/tx/0xde664318df3576d68aded7f70f30ab712d058b71916cc105fc33d5e53fcbed5f
  it('should generate right erc20 tx',  () => {
    const erc20Tx:TxData = {
      to:"0xea26c4ac16d4a5a106820bc8aee85fd0b7b2b664",
      value:"0",
      gasPrice:"0xb2d05e00",
      gasLimit:"0x21660",
      nonce:202,
      memo:"",
      data:"0xa9059cbb000000000000000000000000eeacb7a5e53600c144c0b9839a834bb4b39e540c0000000000000000000000000000000000000000000000000de0b6b3a7640000",
      override:{
        decimals:18,
        tokenShortName:"QKC",
        tokenFullName:"QuarkChain"
      }
    };

    const {txId,txHex} = eth.generateTransactionSync(
        erc20Tx,
        SignProviderWithPrivateKeySync('1e799db5ff3e2df04775afd82bdb3b02302f4d2cdab904cda426032d35768aed')
    );

    expect(txId).toBe('0xde664318df3576d68aded7f70f30ab712d058b71916cc105fc33d5e53fcbed5f');
    expect(txHex).toBe('0xf8aa81ca84b2d05e008302166094ea26c4ac16d4a5a106820bc8aee85fd0b7b2b66480b844a9059cbb000000000000000000000000eeacb7a5e53600c144c0b9839a834bb4b39e540c0000000000000000000000000000000000000000000000000de0b6b3a764000025a0068b92d2cafd9941d7f5d4e128b59b33197014057033b40a83c47b373c089b63a06cf04a6e27d0dc2362d146b0f9a36bd3f4f1aea651017934f9f3537987b15fae');

  });
  it("should sign message sync", () => {
    const message = "hello world";
    const privkey =
      "1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727";
    const signedMessage = eth.signMessageSync(
      message,
        SignProviderWithPrivateKeySync(privkey)
    );
    expect(signedMessage).toBe(
      "0xae35d9375b015664a7b115a63a4515142b68059b164dd187e0b5232d47ca69685104d05d1c6c58b1fe5842f28459e2ea5bd571c0196f10da25fd2140eeef47e500"
    );
  });

  it("should sign message async", async () => {
    const message = "hello world";
    const privkey =
      "1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727";
    const signedMessage = await eth.signMessage(
      message,
        SignProviderWithPrivateKey(privkey)
    );
    expect(signedMessage).toBe(
      "0xae35d9375b015664a7b115a63a4515142b68059b164dd187e0b5232d47ca69685104d05d1c6c58b1fe5842f28459e2ea5bd571c0196f10da25fd2140eeef47e500"
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
    };

    const data2 = {
      nonce: '0x98',
      gasPrice: '0x2540be400',
      gasLimit: '0x5208',
      chainId: 1,
      to: '0x3535353535353535353535353535353535353535',
      value: '0x38d7ea4c68000',
      data: '0x' };
    expect(eth.formatTxData(data1)).toEqual(data2)
  });
});
