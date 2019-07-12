"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (bytes) {
    return bytes.reduce(function (acc, cur) {
        return acc + ("00" + cur.toString(16)).slice(-2);
    }, "");
});
