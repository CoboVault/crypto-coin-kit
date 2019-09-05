"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var sha256 = function (data) {
    return crypto_1.createHash("sha256")
        .update(data)
        .digest();
};
exports.default = (function (data) {
    return sha256(sha256(data));
});
