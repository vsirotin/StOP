/**
 * A transition in compact (runtime) format: [from, signal, to] or [from, signal, to, command]
 */
export type Transition = [string, string, string] | [string, string, string, string];
/**
 * Metadata for a named element (state, signal, or command) in extended format.
 */
export interface ElementMeta {
    name: string;
    description?: string;
    sender?: string;
    receiver?: string;
}
/**
 * A node in the FA tree. Can represent either the root FA or a nested sub-FA.
 *
 * In compact format: the entire FaDefinition value is just a Transition[].
 * In extended format: this object contains states, signals, commands, and ts.
 *
 * A state entry under "states" is either:
 *  - another FaNode (if it has a "ts" key) — a sub-FA
 *  - an ElementMeta (a leaf state with name/description only)
 */
export interface FaNode {
    states?: Record<string, FaNode | ElementMeta>;
    signals?: Record<string, ElementMeta>;
    commands?: Record<string, ElementMeta>;
    ts: Transition[];
}
/**
 * The top-level FA definition object.
 * Key = root FA name, value = FaNode (extended) or Transition[] (compact).
 */
export type FaDefinition = Record<string, FaNode | Transition[]>;
/**
 * An update descriptor applied by updateCompactFA or updateFullFA.
 * - remove: list of FA names to remove (children only; parent ts is cleaned automatically)
 * - add: map of FA name → new definition; existing entries are replaced, new ones inserted
 */
export interface FaUpdate {
    remove?: string[];
    add?: Record<string, FaNode | Transition[]>;
}
/**
 * How the SFSM reacts when a data-carrying command has no data available in the signal.
 */
export type MissingDataPolicy = 'ignore' | 'log_warning' | 'error';
/**
 * How the SFSM reacts when no matching transition is found for a (state, signal) pair.
 */
export type MissingTransitionPolicy = 'ignore' | 'log_warning' | 'error';
/**
 * Configuration options for the SFSM engine.
 */
export interface SfsmOptions {
    byMissingData?: MissingDataPolicy;
    byMissingTransition?: MissingTransitionPolicy;
    /**
     * Joker signal: a transition whose signal slot equals this value matches
     * any signal received while its FA is in that transition's from-state —
     * but only if no transition with the exact, literal signal exists for
     * that state. Useful as a catch-all fallback (e.g. "any unrecognised
     * signal while running ⇒ go to a safe/off state").
     * Default: '*'. Has no effect unless a transition actually uses this
     * value as its signal, so it is safe to leave at the default.
     */
    jokerSignal?: string;
    /**
     * Joker state: a transition whose from-state slot equals this value
     * matches any current state of its FA for that transition's exact
     * signal — but only if no transition with the exact, literal from-state
     * exists for that signal. Useful for a signal that must be handled the
     * same way no matter what state the device is currently in (e.g. a
     * "service" signal that always jumps to a maintenance state).
     * Default: '*'. Has no effect unless a transition actually uses this
     * value as its from-state, so it is safe to leave at the default.
     */
    jokerState?: string;
}
/**
 * A single entry in the processing log.
 * Fields marked (e) are only populated when the FA is in extended format.
 */
export interface LogEntry {
    step: number;
    stack: string[];
    state: string;
    stateName?: string;
    signal: string;
    signalName?: string;
    rule: string;
    newStack: string[];
    newState: string;
    newStateName?: string;
    command?: string;
    commandName?: string;
    receiver?: string;
}
//# sourceMappingURL=types.d.ts.map