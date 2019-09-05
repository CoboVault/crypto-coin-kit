"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (num) {
    var s = num.toString(16);
    return s.length % 2 === 1 ? "0" + s : s;
});
