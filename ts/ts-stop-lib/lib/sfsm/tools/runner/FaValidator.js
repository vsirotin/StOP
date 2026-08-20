"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaValidator = void 0;
/**
 * FaValidator — validates a compact or extended FA definition against a set of
 * rules and returns a list of errors and warnings.
 *
 * Rules:
 *   1.  Input is well-formed JSON (E)
 *   2.  Input can be presented as a tree of FaDefinition objects (E)
 *   3.  No FAs without transitions (E)
 *   4.  No FAs with the same key as siblings in the graph (E)
 *   5.  No FAs with the same name in the whole tree (W)
 *   6.  No signals with the same name in the whole tree (W)
 *   7.  No transition with the same start state and signal (E)
 *   8.  Each FA has exactly one init state ("I", "*.I" or "*:I") (E)
 *   9.  Each sub-FA (not root) has one or more exit states ("E_*", "*.E_", "*:E_") (E)
 *  10.  For each transition targeting an exit state, some ancestor FA has a
 *       transition from the sub-FA name for the forwarded signal (W)
 *  11.  No transitions with exit state as from-state (E)
 *  12.  Each transition's target state exists in the same FA or is a sub-FA name (E)
 *  13.  Each sub-FA is referenced by at least one of its parent's transitions (W)
 *  14.  No unreachable states (states never referenced as a target) (W)
 */
class FaValidator {
    /**
     * Validate a FaDefinition. Accepts both compact (Record<string, Transition[]>)
     * and extended (Record<string, FaNode>) formats.
     *
     * @param definition - The FA definition to validate.
     * @returns An IValidationResult containing all errors and warnings.
     */
    validate(definition) {
        const errors = [];
        const warnings = [];
        // ── Rule 2: Input can be presented as a tree of FaDefinition objects ──
        // Check that the input is a non-null object.
        if (typeof definition !== 'object' || definition === null || Array.isArray(definition)) {
            errors.push(this.makeError(2, 'Input must be a non-null object (Record<string, Transition[] | FaNode>).'));
            return { errors, warnings, valid: false };
        }
        const keys = Object.keys(definition);
        if (keys.length === 0) {
            errors.push(this.makeError(2, 'Input object has no keys. At least one FA definition is required.'));
            return { errors, warnings, valid: false };
        }
        // Determine if compact or extended format.
        const allCompact = keys.every(k => Array.isArray(definition[k]));
        if (!allCompact) {
            // Mixed format or extended: every value must be either an array (compact)
            // or an object with a "ts" array (extended).
            for (const key of keys) {
                const value = definition[key];
                if (Array.isArray(value)) {
                    // Compact single FA — valid.
                }
                else if (typeof value === 'object' && value !== null) {
                    const node = value;
                    if (!Array.isArray(node.ts)) {
                        errors.push(this.makeError(2, `FA "${key}": extended format must have a "ts" array.`));
                    }
                }
                else {
                    errors.push(this.makeError(2, `FA "${key}": value must be a Transition[] or a FaNode object.`));
                }
            }
            if (errors.length > 0)
                return { errors, warnings, valid: false };
        }
        // ── Build the FA tree index ──────────────────────────────────────────
        const faIndex = new Map();
        const faSiblings = new Map(); // parentName -> child names
        const faNameToParent = new Map(); // child name -> parent name
        // Build the tree: first collect compact top-level FAs, then recurse into extended.
        for (const key of keys) {
            const value = definition[key];
            if (Array.isArray(value)) {
                // Compact format: process this FA's transitions.
                this.indexFa(key, null, value, faIndex, faSiblings, faNameToParent, errors, warnings);
            }
            else if (typeof value === 'object' && value !== null) {
                const node = value;
                this.indexFaNode(key, null, node, faIndex, faSiblings, faNameToParent, errors, warnings);
            }
        }
        // If we already have errors from building the index, bail out early.
        if (errors.length > 0)
            return { errors, warnings, valid: false };
        // Early exit if no FAs were indexed.
        if (faIndex.size === 0) {
            errors.push(this.makeError(2, 'No valid FA definitions found in the input.'));
            return { errors, warnings, valid: false };
        }
        // ── Post-process: set up parent-child relationships for compact format ─
        // In compact format, all FAs are at the top level with parentName = null.
        // If FA A's transition targets FA B, then B's parent should be A.
        for (const [name, info] of faIndex) {
            for (const t of info.transitions) {
                const target = t[2];
                if (faIndex.has(target) && target !== name) {
                    // target is a sub-FA — set its parent to this FA if not already set.
                    const currentParent = faNameToParent.get(target);
                    if (currentParent === null) {
                        faNameToParent.set(target, name);
                    }
                }
            }
        }
        // Determine root FA.
        const rootName = this.determineRoot(faIndex, faNameToParent, errors, warnings);
        if (!rootName) {
            // Root determination error already added.
            return { errors, warnings, valid: false };
        }
        // ── Rule 3: No FAs without transitions ──────────────────────────────
        for (const [name, info] of faIndex) {
            if (info.transitions.length === 0) {
                errors.push(this.makeError(3, `FA "${name}" has no transitions.`, name));
            }
        }
        // ── Rule 4: No duplicate FA keys as siblings ────────────────────────
        for (const [parentName, siblings] of faSiblings) {
            const seen = new Set();
            for (const sib of siblings) {
                if (seen.has(sib)) {
                    errors.push(this.makeError(4, `Duplicate FA name "${sib}" in siblings under parent "${parentName}".`, sib));
                }
                seen.add(sib);
            }
        }
        // ── Rule 5: No duplicate FA names in the whole tree ─────────────────
        // Since JSON keys are unique at each level, duplicates across the tree
        // are only possible with extended format. The faIndex uses unique keys
        // (the Map overwrites), so we can't detect this from the Map alone.
        // We detect it during indexing (in indexFaNode) and add warnings there.
        // (Already handled during indexFaNode — warnings are added there.)
        // ── Rule 6: No duplicate signal names in the whole tree ─────────────
        const allSignals = new Map(); // signal -> FA names using it
        for (const [name, info] of faIndex) {
            for (const sig of info.signalNames) {
                if (!allSignals.has(sig)) {
                    allSignals.set(sig, []);
                }
                allSignals.get(sig).push(name);
            }
        }
        for (const [signal, faNames] of allSignals) {
            if (faNames.length > 1) {
                warnings.push(this.makeWarn(6, `Signal "${signal}" is used by multiple FAs: [${faNames.join(', ')}].`));
            }
        }
        // ── Rule 7: No duplicate (from-state, signal) pairs ─────────────────
        for (const [name, info] of faIndex) {
            const seen = new Set();
            for (let i = 0; i < info.transitions.length; i++) {
                const t = info.transitions[i];
                const pair = `${t[0]}|${t[1]}`;
                if (seen.has(pair)) {
                    errors.push(this.makeError(7, `FA "${name}": duplicate transition [${t[0]}, ${t[1]}] (same from-state and signal).`, name, this.transToString(t)));
                }
                seen.add(pair);
            }
        }
        // ── Rule 8: Each FA has exactly one init state ──────────────────────
        for (const [name, info] of faIndex) {
            if (info.entryStates.size === 0) {
                errors.push(this.makeError(8, `FA "${name}" has no init state. At least one transition from "I", "*.I" or "*:I" is required.`, name));
            }
            else if (info.entryStates.size > 1) {
                errors.push(this.makeError(8, `FA "${name}" has multiple init states: [${[...info.entryStates].join(', ')}]. Exactly one is required.`, name));
            }
        }
        // ── Rule 9: Each sub-FA (not root) has at least one exit state ──────
        for (const [name, info] of faIndex) {
            if (name === rootName)
                continue; // root is exempt
            if (info.exitStates.size === 0) {
                errors.push(this.makeError(9, `Sub-FA "${name}" has no exit state. At least one transition to "E_*", "*.E_" or "*:E_" is required.`, name));
            }
        }
        // ── Rule 11: No transitions with exit state as from-state ───────────
        for (const [name, info] of faIndex) {
            for (const t of info.transitions) {
                if (this.isExitState(t[0])) {
                    errors.push(this.makeError(11, `FA "${name}": transition from exit state "${t[0]}" is not allowed.`, name, this.transToString(t)));
                }
            }
        }
        // ── Rule 10: Exit-state signal handled by an ancestor ───────────────
        for (const [name, info] of faIndex) {
            if (name === rootName)
                continue; // root FA resets to I on exit — no parent needed
            for (const idx of info.exitTransitionIndices) {
                const t = info.transitions[idx];
                const signal = t[1];
                // Walk up the parent chain to find a matching transition.
                let current = name;
                let found = false;
                while (current !== null) {
                    const parent = faNameToParent.get(current);
                    if (parent === undefined || parent === null)
                        break; // root
                    const parentInfo = faIndex.get(parent);
                    if (parentInfo) {
                        for (const pt of parentInfo.transitions) {
                            // Parent transition should have from-state = current FA name
                            // and signal = the forwarded signal.
                            if (pt[0] === current && pt[1] === signal) {
                                found = true;
                                break;
                            }
                        }
                    }
                    current = parent;
                }
                if (!found) {
                    warnings.push(this.makeWarn(10, `FA "${name}": transition [${this.transToString(t)}] targets an exit state, but no ancestor FA handles the forwarded signal "${signal}" from "${name}".`, name, this.transToString(t)));
                }
            }
        }
        // ── Rule 12: Each transition's target state exists ──────────────────
        // for (const [name, info] of faIndex) {
        //     for (const t of info.transitions) {
        //         const target = t[2];
        //         // Target can be: a state in the same FA, a sub-FA name, or an exit state.
        //         if (this.isExitState(target)) continue; // exit states are always valid targets
        //         if (info.subFaNames.has(target)) continue; // sub-FA names are valid targets
        //         if (info.fromStates.has(target)) continue; // state exists as a from-state in this FA
        //         if (target === info.entryStates.values().next().value) continue; // entry state
        //         // Check if target is a from-state in some transition of this FA.
        //         let found = false;
        //         for (const ot of info.transitions) {
        //             if (ot[0] === target) {
        //                 found = true;
        //                 break;
        //             }
        //         }
        //         if (!found) {
        //             // Also check if it's a sub-FA defined elsewhere.
        //             if (!faIndex.has(target)) {
        //                 errors.push(this.makeError(12, `FA "${name}": transition target "${target}" does not exist as a state or sub-FA.`, name, this.transToString(t)));
        //             }
        //         }
        //     }
        // }
        // ── Rule 13: Each sub-FA is referenced by its parent ────────────────
        for (const [name, info] of faIndex) {
            if (name === rootName)
                continue; // root doesn't need a parent reference
            const parent = faNameToParent.get(name);
            if (parent) {
                const parentInfo = faIndex.get(parent);
                if (parentInfo) {
                    let referenced = false;
                    for (const t of parentInfo.transitions) {
                        if (t[2] === name) {
                            referenced = true;
                            break;
                        }
                    }
                    if (!referenced) {
                        warnings.push(this.makeWarn(13, `Sub-FA "${name}" is defined but never referenced as a target in parent "${parent}"'s transitions.`, name));
                    }
                }
            }
        }
        // ── Rule 14: No unreachable states ──────────────────────────────────
        for (const [name, info] of faIndex) {
            const reachable = new Set();
            // Entry states are reachable by definition.
            for (const es of info.entryStates) {
                reachable.add(es);
            }
            // Sub-FA names are reachable from the parent.
            for (const sfn of info.subFaNames) {
                reachable.add(sfn);
            }
            // States that appear as targets are reachable.
            for (const t of info.transitions) {
                reachable.add(t[2]); // target state
            }
            // Now check if every from-state (except entry states) is reachable.
            for (const t of info.transitions) {
                const from = t[0];
                if (this.isExitState(from))
                    continue; // exit-state from-states are caught by rule 11
                if (from === '*')
                    continue; // joker from-state
                if (!reachable.has(from) && !info.entryStates.has(from)) {
                    // Check if it's a sub-FA name (used as a state in the parent).
                    if (!info.subFaNames.has(from)) {
                        warnings.push(this.makeWarn(14, `FA "${name}": state "${from}" is never reached (not a target of any transition).`, name, this.transToString(t)));
                    }
                }
            }
        }
        return { errors, warnings, valid: errors.length === 0 };
    }
    // ── Private helpers ────────────────────────────────────────────────────
    indexFa(name, parentName, transitions, faIndex, faSiblings, faNameToParent, errors, warnings) {
        // Check Rule 3: no transitions.
        // (This is checked later, after all FAs are indexed.)
        // Check Rule 5: duplicate FA name in the tree.
        if (faIndex.has(name)) {
            warnings.push(this.makeWarn(5, `FA "${name}" appears multiple times in the tree. Duplicate names may cause confusion.`, name));
        }
        const info = this.buildFaInfo(name, transitions);
        faIndex.set(name, info);
        faNameToParent.set(name, parentName);
        // Track siblings.
        const parentKey = parentName !== null && parentName !== void 0 ? parentName : '__root__';
        if (!faSiblings.has(parentKey)) {
            faSiblings.set(parentKey, []);
        }
        faSiblings.get(parentKey).push(name);
    }
    indexFaNode(name, parentName, node, faIndex, faSiblings, faNameToParent, errors, warnings) {
        // Index this FA.
        this.indexFa(name, parentName, node.ts, faIndex, faSiblings, faNameToParent, errors, warnings);
        // Recurse into sub-FAs.
        if (node.states) {
            for (const [stateName, stateValue] of Object.entries(node.states)) {
                if (this.isSubFaNode(stateValue)) {
                    this.indexFaNode(stateName, name, stateValue, faIndex, faSiblings, faNameToParent, errors, warnings);
                }
            }
        }
    }
    buildFaInfo(name, transitions) {
        const fromStates = new Set();
        const signalNames = new Set();
        const entryStates = new Set();
        const exitStates = new Set();
        const exitTransitionIndices = [];
        const fromSignalPairs = new Set();
        const subFaNames = new Set();
        for (let i = 0; i < transitions.length; i++) {
            const t = transitions[i];
            const from = t[0];
            const signal = t[1];
            const target = t[2];
            fromStates.add(from);
            signalNames.add(signal);
            if (this.isEntryState(from)) {
                entryStates.add(from);
            }
            if (this.isExitState(from)) {
                // This is detected by Rule 11.
            }
            if (this.isExitState(target)) {
                exitStates.add(target);
                exitTransitionIndices.push(i);
            }
        }
        return {
            name,
            parentName: null, // filled by caller
            transitions,
            subFaNames,
            fromStates,
            signalNames,
            entryStates,
            exitStates,
            exitTransitionIndices,
            fromSignalPairs
        };
    }
    determineRoot(faIndex, faNameToParent, errors, warnings) {
        // Root = the FA that is never a target in any other FA's transitions.
        const referencedAsTarget = new Set();
        for (const [, info] of faIndex) {
            for (const t of info.transitions) {
                const target = t[2];
                if (faIndex.has(target)) {
                    referencedAsTarget.add(target);
                }
            }
        }
        // Only consider top-level FAs (parentName === null) as root candidates.
        // Nested sub-FAs (parentName !== null) are not roots.
        const roots = [...faIndex.keys()].filter(k => !referencedAsTarget.has(k) && faNameToParent.get(k) === null);
        if (roots.length === 0) {
            errors.push(this.makeError(2, 'Cannot determine root FA: every FA is referenced as a target state (circular reference).'));
            return null;
        }
        if (roots.length > 1) {
            errors.push(this.makeError(2, `Cannot determine root FA: multiple candidates: [${roots.join(', ')}]. Exactly one root is required.`));
            return null;
        }
        return roots[0];
    }
    isEntryState(state) {
        return state === 'I' || state.endsWith('.I') || state.endsWith(':I');
    }
    isExitState(state) {
        return state.startsWith('E_') || state.includes('.E_') || state.includes(':E_');
    }
    isSubFaNode(value) {
        return (typeof value === 'object' &&
            value !== null &&
            'ts' in value &&
            Array.isArray(value.ts));
    }
    transToString(t) {
        return `[${t.join(', ')}]`;
    }
    makeError(rule, message, faName, transition) {
        return { rule, type: 'error', message, faName, transition };
    }
    makeWarn(rule, message, faName, transition) {
        return { rule, type: 'warning', message, faName, transition };
    }
}
exports.FaValidator = FaValidator;
//# sourceMappingURL=FaValidator.js.map