"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var dcr_core_1 = require("dcr-core");
exports.default = (function (inputs) {
    return inputs.map(function (item) { return (__assign(__assign({}, item), { script: dcr_core_1.Script.buildPublicKeyHashOut(item.address).toString() })); });
});
