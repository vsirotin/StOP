"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeFAs = mergeFAs;
const FaReducer_1 = require("./FaReducer");
/**
 * Merges multiple FA definitions into one compact multi-FA object.
 *
 * Each input is reduced first (same semantics as reduceFA). If an input is
 * already compact, reduceFA returns it unchanged.
 *
 * On duplicate FA keys, the later input overwrites the previous one and a
 * warning entry is emitted.
 */
function mergeFAs(definitions) {
    const merged = {};
    const warnings = [];
    for (let fileIndex = 0; fileIndex < definitions.length; fileIndex++) {
        const reduced = (0, FaReducer_1.reduceFA)(definitions[fileIndex]);
        for (const [faName, transitions] of Object.entries(reduced)) {
            if (Object.prototype.hasOwnProperty.call(merged, faName)) {
                warnings.push(`Duplicate FA key '${faName}' encountered at input #${fileIndex + 1}. Last definition wins.`);
            }
            merged[faName] = transitions;
        }
    }
    return { merged, warnings };
}
//# sourceMappingURL=FaMerger.js.map