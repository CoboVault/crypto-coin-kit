import * as bitcoin from "bitcoinjs-lib";
import { Output } from "bitcoinjs-lib/types/transaction";
import PsbtBuilder from "../../../BTC/txBuilder";

const publicKey =
  "03fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72";

const publicKeyOne =
  "02f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa2";

const utxoOne = {
  hash: "d07ce19af4ff4088884dcee2cedba39c364e34f7cfd0b35bb2e07c8c15b07355",
  index: 1,
  utxo: {
    publicKey,
    script: "a914915892366a6cdf24afa6e1c480db2ad88c63378087",
    value: 3578100
  },
  bip32Derivation: [{
    pubkey: Buffer.from(publicKeyOne, 'hex'),
    masterFingerprint: Buffer.from('01010101', 'hex'),
    path: `m/49'/0'/0'/0/0`,
  }]
};

const utxoTwo = {
  hash: "89e5f831aa67e0f0dad44f9e7a5f06322a7270da02b837e3666a486323dc14e0",
  index: 0,
  utxo: {
    publicKey: publicKeyOne,
    script: "a914745c56190d1fe8274e7ebe9dd4fe10ca3484959587",
    value: 2524291
  },
  bip32Derivation: [{
    pubkey: Buffer.from(publicKeyOne, 'hex'),
    masterFingerprint: Buffer.from('01010101', 'hex'),
    path: `m/49'/0'/0'/0/0`,
  }]
};

describe("BTC.TxBuilder", () => {
  it("should add the input for psbt", () => {
    const txb = new PsbtBuilder(bitcoin.networks.regtest);
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4",
        amount: 102391,
        fee: 1000,
        changeAddress: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4"
      }
    };
    const psbt = txb.addInputsForPsbt(txData).getPsbt();
    expect(psbt.data.inputs.length).toEqual(2);
    expect(psbt.toBase64()).toEqual(
      "cHNidP8BAFwCAAAAAlVzsBWMfOCyW7PQz/c0Tjaco9vO4s5NiIhA//Sa4XzQAQAAAAD/////4BTcI2NIambjN7gC2nByKjIGX3qeT9Ta8OBnqjH45YkAAAAAAP////8AAAAAAAABASD0mDYAAAAAABepFJFYkjZqbN8kr6bhxIDbKtiMYzeAhwEEFgAU6c+RMdnAKjoC0ka7Qpe1YGxssvkiBgLzJahZAtJk28sMvhROmyRj+CUr0MUbwZZm9MgkYeS6ohgBAQEBMQAAgAAAAIAAAACAAAAAAAAAAAAAAQEgg4QmAAAAAAAXqRR0XFYZDR/oJ05+vp3U/hDKNISVlYcBBBYAFDAHq9r+j4dcPTtxRCjndhSUpx9sIgYC8yWoWQLSZNvLDL4UTpskY/glK9DFG8GWZvTIJGHkuqIYAQEBATEAAIAAAACAAAAAgAAAAAAAAAAAAAA="
    );
  });

  it("should throw error if the input is not matched", () => {
    const txb = new PsbtBuilder(bitcoin.networks.regtest);
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4",
        amount: 8578100,
        fee: 1000,
        changeAddress: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4"
      }
    };
    expect(() => txb.addInputsForPsbt(txData).getPsbt()).toThrowError(
      /input value are invaild/
    );
  });

  it('should create correct script from public key',  () => {
    const txb = new PsbtBuilder(bitcoin.networks.bitcoin);
    expect(txb.calculateScript(publicKey).toString('hex')).toBe("a914915892366a6cdf24afa6e1c480db2ad88c63378087");
    expect(txb.calculateScript(publicKeyOne).toString('hex')).toBe("a914745c56190d1fe8274e7ebe9dd4fe10ca3484959587");
  });
  it("should add the output for psbt", () => {
    const txb = new PsbtBuilder(bitcoin.networks.regtest);
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4",
        amount: 102391,
        fee: 1000,
        changeAddress: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4"
      }
    };
    const psbt = txb
      .addInputsForPsbt(txData)
      .addOutputForPsbt(txData)
      .getPsbt();

    expect(psbt.toBase64()).toEqual(
      "cHNidP8BAJwCAAAAAlVzsBWMfOCyW7PQz/c0Tjaco9vO4s5NiIhA//Sa4XzQAQAAAAD/////4BTcI2NIambjN7gC2nByKjIGX3qeT9Ta8OBnqjH45YkAAAAAAP////8C948BAAAAAAAXqRSRWJI2amzfJK+m4cSA2yrYjGM3gIeYiVsAAAAAABepFJFYkjZqbN8kr6bhxIDbKtiMYzeAhwAAAAAAAQEg9Jg2AAAAAAAXqRSRWJI2amzfJK+m4cSA2yrYjGM3gIcBBBYAFOnPkTHZwCo6AtJGu0KXtWBsbLL5IgYC8yWoWQLSZNvLDL4UTpskY/glK9DFG8GWZvTIJGHkuqIYAQEBATEAAIAAAACAAAAAgAAAAAAAAAAAAAEBIIOEJgAAAAAAF6kUdFxWGQ0f6CdOfr6d1P4QyjSElZWHAQQWABQwB6va/o+HXD07cUQo53YUlKcfbCIGAvMlqFkC0mTbywy+FE6bJGP4JSvQxRvBlmb0yCRh5LqiGAEBAQExAACAAAAAgAAAAIAAAAAAAAAAAAAAAA=="
    );
    expect(psbt.data.outputs.length).toEqual(2);
    const tx = bitcoin.Transaction.fromBuffer(psbt.data.getTransaction());
    expect(tx.outs[0].script.toString("hex")).toEqual(
      "a914915892366a6cdf24afa6e1c480db2ad88c63378087"
    );
    const output = tx.outs[0] as Output;
    expect(output.value).toEqual(102391);
  });
});
