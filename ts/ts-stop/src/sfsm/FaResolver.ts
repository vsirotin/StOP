import { FaDefinition, FaNode, Transition } from './types';

/**
 * Resolved, flat representation of one FA ready for engine processing.
 */
export interface ResolvedFa {
    name: string;
    transitions: Transition[];
    /** Keys of states that are themselves sub-FAs (have their own ts list). */
    subFaNames: Set<string>;
    node: FaNode;
    /**
     * The literal entry-state name actually used by this FA's own transitions:
     * either the bare `"I"` (default convention), or a namespaced `"<FaName>.I"`
     * (recommended for large stacked SFSMs — see Tutorial.md §8.1). Auto-detected
     * by scanning this FA's transitions for a from-state equal to `"I"` or ending
     * in `".I"`; falls back to `"I"` if none is found.
     */
    entryState: string;
}

/**
 * Parses a raw FaDefinition and builds a flat index of all FAs by name.
 *
 * A state entry is considered a sub-FA if its value object contains a "ts" key.
 * Leaf states (no "ts") are plain named states.
 */
export class FaResolver {

    private index = new Map<string, ResolvedFa>();

    constructor(private definition: FaDefinition) {
        this.buildIndex();
    }

    /** Returns the resolved FA for the given name, or throws if not found. */
    get(name: string): ResolvedFa {
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
    getRootName(): string {
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
        const referenced = new Set<string>();
        for (const key of keys) {
            const transitions = this.definition[key] as Transition[];
            for (const t of transitions) {
                referenced.add(t[2]); // newState is at index 2
            }
        }

        // Root = the FA name that is never a target in any other FA's transitions
        const roots = keys.filter(k => !referenced.has(k));
        if (roots.length !== 1) {
            throw new Error(
                `SFSM: Cannot determine root FA. Candidates: [${roots.join(', ')}]. ` +
                `All FA names: [${keys.join(', ')}].`
            );
        }
        return roots[0];
    }

    private buildIndex(): void {
        const entries = Object.entries(this.definition);
        const allCompact = entries.every(([, v]) => Array.isArray(v));

        if (allCompact && entries.length > 1) {
            // Multi-key compact format: index all FAs, sub-FA names derived from definition keys
            this.buildCompactMultiIndex();
        } else {
            const rootName = this.getRootName();
            const rootValue = this.definition[rootName];

            if (Array.isArray(rootValue)) {
                // Single-key compact format
                const node: FaNode = { ts: rootValue as Transition[] };
                this.index.set(rootName, {
                    name: rootName,
                    transitions: rootValue as Transition[],
                    subFaNames: new Set(),
                    node,
                    entryState: this.resolveEntryState(rootValue as Transition[])
                });
            } else {
                // Extended format
                this.indexNode(rootName, rootValue as FaNode);
            }
        }
    }

    private buildCompactMultiIndex(): void {
        const definedFaNames = new Set(Object.keys(this.definition));

        for (const [name, value] of Object.entries(this.definition)) {
            const transitions = value as Transition[];
            // A state is a sub-FA if its name is a key in the definition
            const subFaNames = new Set(
                transitions
                    .map(t => t[2])
                    .filter(target => definedFaNames.has(target))
            );
            const node: FaNode = { ts: transitions };
            this.index.set(name, {
                name,
                transitions,
                subFaNames,
                node,
                entryState: this.resolveEntryState(transitions)
            });
        }
    }

    private indexNode(name: string, node: FaNode): void {
        const subFaNames = new Set<string>();

        if (node.states) {
            for (const [stateName, stateValue] of Object.entries(node.states)) {
                if (this.isSubFa(stateValue)) {
                    subFaNames.add(stateName);
                    this.indexNode(stateName, stateValue as FaNode);
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
    private isSubFa(value: unknown): boolean {
        return (
            typeof value === 'object' &&
            value !== null &&
            'ts' in value &&
            Array.isArray((value as FaNode).ts)
        );
    }

    /**
     * Auto-detects the literal entry-state name used by a FA's own transitions:
     * the bare `"I"`, or a namespaced `"<FaName>.I"` (e.g. `"TS.I"`). Falls back
     * to `"I"` if the FA has no transition whose from-state matches either form.
     */
    private resolveEntryState(transitions: Transition[]): string {
        for (const t of transitions) {
            if (t[0] === 'I' || t[0].endsWith(':I') || t[0].endsWith('.I')) {
                return t[0];
            }
        }
        return 'I';
    }
}
