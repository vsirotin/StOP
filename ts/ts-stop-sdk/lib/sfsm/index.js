"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFAFromURL = exports.loadFAFromFile = void 0;
// Re-export the core cross-platform library from @vsirotin/ts-stop,
// then add the Node-only loader provided by the SDK.
__exportStar(require("@vsirotin/ts-stop/sfsm"), exports);
var FaLoader_1 = require("./tools/FaLoader");
Object.defineProperty(exports, "loadFAFromFile", { enumerable: true, get: function () { return FaLoader_1.loadFAFromFile; } });
Object.defineProperty(exports, "loadFAFromURL", { enumerable: true, get: function () { return FaLoader_1.loadFAFromURL; } });
//# sourceMappingURL=index.js.map