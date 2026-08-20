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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFAFromFile = loadFAFromFile;
exports.loadFAFromURL = loadFAFromURL;
const fs = __importStar(require("fs"));
/**
 * Reads and parses a JSON file at the given path and returns it as a FaDefinition.
 * Works with both extended and compact formats.
 *
 * Node.js only — uses `fs.readFileSync` and is not available in browser environments.
 *
 * @param filePath - Absolute or relative path to a JSON file containing an FA definition.
 * @returns Parsed FaDefinition ready to pass to `Sfsm.loadFA()`.
 * @throws If the file cannot be read or the contents are not valid JSON.
 */
function loadFAFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}
/**
 * Fetches and parses a JSON FA definition from a URL.
 * Works in both browser and Node.js (≥ 18) environments — uses the standard `fetch` API.
 *
 * @param url - Absolute URL to a JSON file containing an FA definition.
 * @returns Promise resolving to a FaDefinition ready to pass to `Sfsm.loadFA()`.
 * @throws If the request fails, the server returns a non-2xx status, or the body is not valid JSON.
 */
async function loadFAFromURL(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`loadFAFromURL: request failed with status ${response.status} ${response.statusText} for URL: ${url}`);
    }
    return response.json();
}
//# sourceMappingURL=FaLoader.js.map