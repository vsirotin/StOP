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
    sender?: string;    // for signals
    receiver?: string;  // for commands
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
}

/**
 * A single entry in the processing log.
 * Fields marked (e) are only populated when the FA is in extended format.
 */
export interface LogEntry {
    step: number;
    stack: string[];            // FA names from bottom to head, e.g. ['TS', 'PP', 'CPP']
    state: string;              // abbreviation of active state before transition
    stateName?: string;         // (e) human-readable state name
    signal: string;             // signal that triggered this step
    signalName?: string;        // (e) human-readable signal name
    rule: string;               // rule number applied, e.g. '2.1.1' or '3' or '4.2'
    newStack: string[];         // stack after transition
    newState: string;           // new active state abbreviation
    newStateName?: string;      // (e) human-readable new state name
    command?: string;           // command sent (if any)
    commandName?: string;       // (e) human-readable command name
    receiver?: string;          // (e) receiver of the command
}
