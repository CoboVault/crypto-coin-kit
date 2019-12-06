import { NEO } from "../../NEO";
import {
  buildNeoBalance,
  buildNeoClaims,
  SignProviderWithPrivateKey,
  SignProviderWithPrivateKeySync
} from "../../NEO/utils";
import neoData from "../fixtures/neo";

describe("coin.NEO", () => {
  it("should get right address when generate the address", () => {
    const testPublicKey =
      "03cf9257d37f4ed524ba90a794fd96b958f3d7b3a4d2bb6baa11b120d15eade3d1";
    const address = new NEO().generateAddress(testPublicKey);
    expect(address).toEqual("AVr6BhSsy64hZqz4dFehX62o2UxsotXf2z");
  });

  it("should return true if it is a valid address", () => {
    expect(
      new NEO().isAddressValid("AVr6BhSsy64hZqz4dFehX62o2UxsotXf2z")
    ).toEqual(true);
  });

  it("should generate signed tx as async", async () => {
    const neoBalance = buildNeoBalance({ ...neoData, net: "TestNet" });

    const neo = new NEO();

    const pKSignProvider = SignProviderWithPrivateKey(
      "2181be39a81f8fd84a785455bf44ff2f44582c5c03cd9e92a63cf026469f835e"
    );

    const { txId, txHex } = await neo.generateTransaction(
      {
        tokenName: "NEO",
        to: "AdeLEMZrNSA7wn5koFxL2AG35UHvFU1vf5",
        amount: 10,
        memo: "test net neo",
        balance: neoBalance
      },
      pKSignProvider,
      {
        signerPubkey:
          "03cf9257d37f4ed524ba90a794fd96b958f3d7b3a4d2bb6baa11b120d15eade3d1"
      }
    );

    expect(txId).toEqual(
      "7105c4c478cb7c0c0cdd333bd05d2719a9974ed2a29982d7c695620821849fe0"
    );

    expect(txHex).toEqual(
      "800001f00c74657374206e6574206e656f0119bc2b805aefefc1b063860707c55196f4aefc7435013d580fd6f31e2debaa2f0000029b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc500ca9a3b00000000efe5a16b0d98a09c8d7a4ec2f6788de68de726539b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc5001edc0c170000009a5de415a8276d2aee166d685c3afaeffb9d23ab014140bf5d27187bd8fc04ebc4ad4f69e4c0ecb0ac2bd9c3f879b747984a3217282f0e249ef4e1edf4ffb5dd5bbcccfc66610e183cdc64206a6b26855219a5f611bae5232103cf9257d37f4ed524ba90a794fd96b958f3d7b3a4d2bb6baa11b120d15eade3d1ac"
    );
  });

  it("should generate signed tx as sync function", () => {
    const neoBalance = buildNeoBalance({ ...neoData, net: "TestNet" });

    const neo = new NEO();

    const pKSignProviderSync = SignProviderWithPrivateKeySync(
      "2181be39a81f8fd84a785455bf44ff2f44582c5c03cd9e92a63cf026469f835e"
    );

    const { txId, txHex } = neo.generateTransactionSync(
      {
        tokenName: "NEO",
        to: "AdeLEMZrNSA7wn5koFxL2AG35UHvFU1vf5",
        amount: 10,
        memo: "test net neo",
        balance: neoBalance
      },
      pKSignProviderSync,
      {
        signerPubkey:
          "03cf9257d37f4ed524ba90a794fd96b958f3d7b3a4d2bb6baa11b120d15eade3d1"
      }
    );

    expect(txId).toEqual(
      "7105c4c478cb7c0c0cdd333bd05d2719a9974ed2a29982d7c695620821849fe0"
    );

    expect(txHex).toEqual(
      "800001f00c74657374206e6574206e656f0119bc2b805aefefc1b063860707c55196f4aefc7435013d580fd6f31e2debaa2f0000029b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc500ca9a3b00000000efe5a16b0d98a09c8d7a4ec2f6788de68de726539b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc5001edc0c170000009a5de415a8276d2aee166d685c3afaeffb9d23ab014140bf5d27187bd8fc04ebc4ad4f69e4c0ecb0ac2bd9c3f879b747984a3217282f0e249ef4e1edf4ffb5dd5bbcccfc66610e183cdc64206a6b26855219a5f611bae5232103cf9257d37f4ed524ba90a794fd96b958f3d7b3a4d2bb6baa11b120d15eade3d1ac"
    );
  });

  it("should sign message and return expected result", async () => {
    const neo = new NEO();
    const pKSignProvider = SignProviderWithPrivateKey(
      "2181be39a81f8fd84a785455bf44ff2f44582c5c03cd9e92a63cf026469f835e"
    );
    const result = await neo.signMessage("hello", pKSignProvider);
    expect(result).toEqual(
      "ce8c78067b377821be22e383ba81752f0f9436361c1fa8de1fe3d93a67e641e19eac5fb7a724a3de5901b08ce4adc58439185b040fbafe46f8464d2d31c7a0c3"
    );
  });

  it("should sign message and return expected result", () => {
    const neo = new NEO();
    const pKSignProviderSync = SignProviderWithPrivateKeySync(
      "2181be39a81f8fd84a785455bf44ff2f44582c5c03cd9e92a63cf026469f835e"
    );
    const result = neo.signMessageSync("hello", pKSignProviderSync);
    expect(result).toEqual(
      "ce8c78067b377821be22e383ba81752f0f9436361c1fa8de1fe3d93a67e641e19eac5fb7a724a3de5901b08ce4adc58439185b040fbafe46f8464d2d31c7a0c3"
    );
  });
});

describe("neo.utilis", () => {
  it("shoudld return right balance if the assets is empty", () => {
    const testNoneBalance = {
      address: "Ax12384",
      balance: []
    };
    const emptyBalance = buildNeoBalance({
      ...testNoneBalance,
      net: "TestNet"
    });
    expect(emptyBalance.address).toEqual("Ax12384");
    expect(emptyBalance.assets).toEqual({});
    expect(emptyBalance.assetSymbols.length).toEqual(0);
  });

  it("should return the NEP 5 token balance if have", () => {
    const testTokenBalance = {
      balance: [
        {
          unspent: [],
          asset_symbol: "GAS",
          asset_hash:
            "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7",
          asset: "GAS",
          amount: 0.0
        },
        {
          unspent: [],
          asset_symbol: "TKY",
          asset_hash: "132947096727c84c7f9e076c90f08fec3bc17f18",
          asset: "THEKEY Token",
          amount: 206500.0
        }
      ],
      address: "ANdRzFq5BCWL1kgVSmTEuEQEUyxrY8nbKH"
    };

    const tokeBalance = buildNeoBalance({
      ...testTokenBalance,
      net: "TestNet"
    });
    expect(tokeBalance.assetSymbols).toEqual(["GAS"]);
    expect(tokeBalance.tokenSymbols).toEqual(["TKY"]);
    expect(tokeBalance.tokens.TKY.toFixed()).toEqual("206500");
  });

  it("should return neo claims", () => {
    const testClaims = {
      unclaimed: 0.2139291,
      claimable: [
        {
          value: 990.0,
          unclaimed: 0.2139291,
          txid:
            "7105c4c478cb7c0c0cdd333bd05d2719a9974ed2a29982d7c695620821849fe0",
          sys_fee: 0.068607,
          start_height: 2879709,
          n: 1,
          generated: 0.1453221,
          end_height: 2881806
        }
      ],
      address: "AVr6BhSsy64hZqz4dFehX62o2UxsotXf2z"
    };
    const claim = buildNeoClaims(
      testClaims.address,
      "TestNet",
      testClaims.claimable
    );
    expect(claim.claims.length).toEqual(1);
    expect(claim.claims[0].txid).toEqual(
      "7105c4c478cb7c0c0cdd333bd05d2719a9974ed2a29982d7c695620821849fe0"
    );
  });
});
