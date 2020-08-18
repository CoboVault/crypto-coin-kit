'use strict';

module.exports = {
  bip39Generate,
  bip39ToEntropy,
  bip39ToMiniSecret,
  bip39ToSeed,
  bip39Validate,

  ed25519KeypairFromSeed,
  ed25519Sign,
  ed25519Verify,

  sr25519DeriveKeypairHard,
  sr25519DeriveKeypairSoft,
  sr25519DerivePublicSoft,
  sr25519KeypairFromSeed,
  sr25519Sign,
  sr25519Verify,

  blake2b,
  keccak256,
  pbkdf2,
  scrypt,

  // secp256k1IsRecoverable: wrapReady(stubbed.ext_secp256k1_is_recoverable);
  // secp256k1Recover: wrapReady(stubbed.ext_secp256k1_recover);

  sha512,
  twox,

  isReady,
  waitReady,
};

function bip39Generate(word) {
  return '';
}
function bip39ToEntropy(phrase) {}
function bip39ToMiniSecret(phrase, password) {}
function bip39ToSeed(phrase, password) {}
function bip39Validate(phrase) {}

function ed25519KeypairFromSeed(seed) {}
function ed25519Sign(publicKey, secretKey, message) {}
function ed25519Verify(signature, message, publicKey) {}

function sr25519DeriveKeypairHard(pair, chainCode) {}
function sr25519DeriveKeypairSoft(pair, chainCode) {}
function sr25519DerivePublicSoft(publicKey, chainCode) {}
function sr25519KeypairFromSeed(seed) {}
function sr25519Sign(publicKey, secretKey, message) {}
function sr25519Verify(signature, message, publicKey) {}

function blake2b(data, key, byteSize) {}
function keccak256(data) {}
function pbkdf2(data, salt, rounds) {}
function scrypt(password, salt, log2N, r, p) {}
// export function secp256k1IsRecoverable (message: Uint8Array, signature: Uint8Array): number;
// export function secp256k1Recover (message: Uint8Array, signature: Uint8Array): Uint8Array;
function sha512(data) {}
function twox(data, rounds) {}

function isReady() {
  return false;
}
function waitReady() {
  return new Promise(resolve => {
    resolve(true);
  });
}
