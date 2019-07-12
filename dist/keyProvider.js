"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var buffer_1 = require("buffer");
// @ts-ignore
var secp256k1_1 = __importDefault(require("secp256k1"));
// @ts-ignore
var secp256r1_1 = __importDefault(require("secp256r1"));
var tweetnacl_1 = __importDefault(require("tweetnacl"));
var KeyProvider = /** @class */ (function () {
    function KeyProvider(args) {
        var _this = this;
        this.getPublicKey = function () {
            if (_this.publicKey) {
                return _this.publicKey;
            }
            switch (_this.keyType) {
                case "ed25519":
                    return _this.ed25519GetPublicKey();
                case "secp256k1":
                    return _this.secp256k1GetPublicKey();
                case "secp256r1":
                    return _this.secp256r1GetPublicKey();
            }
        };
        this.checkPrivateKey = function (privateKey) {
            return privateKey.length >= 32;
        };
        this.checkKeyType = function (keyType) {
            return !(keyType !== "secp256k1" &&
                keyType !== "secp256r1" &&
                keyType !== "ed25519");
        };
        this.secp256k1GetPublicKey = function () {
            if (!_this.privateKey) {
                throw new Error("No private key provided");
            }
            var privateKeyData = buffer_1.Buffer.from(_this.privateKey, "hex");
            var publicKeyData = secp256k1_1.default.publicKeyCreate(privateKeyData);
            return publicKeyData.toString("hex");
        };
        this.secp256r1GetPublicKey = function () {
            if (!_this.privateKey) {
                throw new Error("No private key provided");
            }
            var privateKeyData = buffer_1.Buffer.from(_this.privateKey, "hex");
            var publicKeyData = secp256r1_1.default.publicKeyCreate(privateKeyData);
            return publicKeyData.toString("hex");
        };
        this.ed25519GetPublicKey = function () {
            if (!_this.privateKey) {
                throw new Error("No private key provided");
            }
            var privateKeyData = buffer_1.Buffer.from(_this.privateKey, "hex");
            var keyPair = tweetnacl_1.default.sign.keyPair.fromSeed(new Uint8Array(privateKeyData));
            // @ts-ignore
            return bytesToHex(keyPair.publicKey);
        };
        var privateKey = args.privateKey, publicKey = args.publicKey, keyType = args.keyType;
        if (!this.checkKeyType(keyType)) {
            throw new Error("invalid key type: " + keyType);
        }
        if (privateKey && !this.checkPrivateKey(privateKey)) {
            throw new Error("invalid privateKey: " + privateKey + ", should be 32 byte hex");
        }
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        this.keyType = keyType;
    }
    return KeyProvider;
}());
exports.KeyProvider = KeyProvider;
