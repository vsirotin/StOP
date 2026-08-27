/**
 * Parses a raw FaDefinition and builds a flat index of all FAs by name.
 *
 * A state entry is considered a sub-FA if its value object contains a "ts" key.
 * Leaf states (no "ts") are plain named states.
 */
export class FaResolver {
    constructor(definition) {
        this.definition = definition;
        this.index = new Map();
        this.buildIndex();
    }
    /** Returns the resolved FA for the given name, or throws if not found. */
    get(name) {
        const fa = this.index.get(name);
        if (!fa) {
            throw new Error(`SFSM: FA "${name}" not found in definition.`);
        }
        return fa;
    }
    /** Returns the name of the root FA.
     *
     * For single-key definitions (compact single FA or extended FA), the sole key is the root.
     * For multi-key compact definitions (all values are Transition[]), the root is the FA whose
     * name is never referenced as a target state (3rd element) in any other FA's transitions.
     */
    getRootName() {
        const keys = Object.keys(this.definition);
        if (keys.length === 1) {
            return keys[0];
        }
        // Multi-key: all values must be Transition[]
        const allCompact = keys.every(k => Array.isArray(this.definition[k]));
        if (!allCompact) {
            throw new Error(`SFSM: Multi-key FA definition must use compact format (all values must be Transition[]).`);
        }
        // Collect all target state names referenced across all transitions
        const referenced = new Set();
        for (const key of keys) {
            const transitions = this.definition[key];
            for (const t of transitions) {
                referenced.add(t[2]); // newState is at index 2
            }
        }
        // Root = the FA name that is never a target in any other FA's transitions
        const roots = keys.filter(k => !referenced.has(k));
        if (roots.length !== 1) {
            throw new Error(`SFSM: Cannot determine root FA. Candidates: [${roots.join(', ')}]. ` +
                `All FA names: [${keys.join(', ')}].`);
        }
        return roots[0];
    }
    buildIndex() {
        const entries = Object.entries(this.definition);
        const allCompact = entries.every(([, v]) => Array.isArray(v));
        if (allCompact && entries.length > 1) {
            // Multi-key compact format: index all FAs, sub-FA names derived from definition keys
            this.buildCompactMultiIndex();
        }
        else {
            const rootName = this.getRootName();
            const rootValue = this.definition[rootName];
            if (Array.isArray(rootValue)) {
                // Single-key compact format
                const node = { ts: rootValue };
                this.index.set(rootName, {
                    name: rootName,
                    transitions: rootValue,
                    subFaNames: new Set(),
                    node,
                    entryState: this.resolveEntryState(rootValue)
                });
            }
            else {
                // Extended format
                this.indexNode(rootName, rootValue);
            }
        }
    }
    buildCompactMultiIndex() {
        const definedFaNames = new Set(Object.keys(this.definition));
        for (const [name, value] of Object.entries(this.definition)) {
            const transitions = value;
            // A state is a sub-FA if its name is a key in the definition
            const subFaNames = new Set(transitions
                .map(t => t[2])
                .filter(target => definedFaNames.has(target)));
            const node = { ts: transitions };
            this.index.set(name, {
                name,
                transitions,
                subFaNames,
                node,
                entryState: this.resolveEntryState(transitions)
            });
        }
    }
    indexNode(name, node) {
        const subFaNames = new Set();
        if (node.states) {
            for (const [stateName, stateValue] of Object.entries(node.states)) {
                if (this.isSubFa(stateValue)) {
                    subFaNames.add(stateName);
                    this.indexNode(stateName, stateValue);
                }
            }
        }
        this.index.set(name, {
            name,
            transitions: node.ts,
            subFaNames,
            node,
            entryState: this.resolveEntryState(node.ts)
        });
    }
    /** A state value is a sub-FA if it has a "ts" array property. */
    isSubFa(value) {
        return (typeof value === 'object' &&
            value !== null &&
            'ts' in value &&
            Array.isArray(value.ts));
    }
    /**
     * Auto-detects the literal entry-state name used by a FA's own transitions:
     * the bare `"I"`, or a namespaced `"<FaName>.I"` (e.g. `"TS.I"`). Falls back
     * to `"I"` if the FA has no transition whose from-state matches either form.
     */
    resolveEntryState(transitions) {
        for (const t of transitions) {
            if (t[0] === 'I' || t[0].endsWith(':I') || t[0].endsWith('.I')) {
                return t[0];
            }
        }
        return 'I';
    }
}
