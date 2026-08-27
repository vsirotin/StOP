import { FaDefinition, FaNode, Transition } from '../types';
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
export declare class FaResolver {
    private definition;
    private index;
    constructor(definition: FaDefinition);
    /** Returns the resolved FA for the given name, or throws if not found. */
    get(name: string): ResolvedFa;
    /** Returns the name of the root FA.
     *
     * For single-key definitions (compact single FA or extended FA), the sole key is the root.
     * For multi-key compact definitions (all values are Transition[]), the root is the FA whose
     * name is never referenced as a target state (3rd element) in any other FA's transitions.
     */
    getRootName(): string;
    private buildIndex;
    private buildCompactMultiIndex;
    private indexNode;
    /** A state value is a sub-FA if it has a "ts" array property. */
    private isSubFa;
    /**
     * Auto-detects the literal entry-state name used by a FA's own transitions:
     * the bare `"I"`, or a namespaced `"<FaName>.I"` (e.g. `"TS.I"`). Falls back
     * to `"I"` if the FA has no transition whose from-state matches either form.
     */
    private resolveEntryState;
}
//# sourceMappingURL=FaResolver.d.ts.map