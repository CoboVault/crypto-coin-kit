"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (buf) {
    var buf2 = Buffer.alloc(buf.length);
    for (var i = 0; i < buf.length; i++) {
        buf2[i] = buf[buf.length - 1 - i];
    }
    return buf2;
});
