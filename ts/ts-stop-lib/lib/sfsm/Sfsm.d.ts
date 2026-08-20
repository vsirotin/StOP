import { FaDefinition, LogEntry, SfsmOptions } from './types';
import { ICommandReceiver, ISignalReceiver } from './interfaces';
/**
 * Stacked Finite State Machine engine.
 *
 * Usage:
 *   const sfsm = new Sfsm(options);
 *   sfsm.setCommandReceiver(receiver);
 *   sfsm.loadFA(definition);   // auto-activates state I of root FA
 *   sfsm.receiveSignal('TS>start');
 *
 * Signal re-entrancy: if receiveSignal is called while the engine is already
 * processing a signal (e.g. from within a command receiver callback), the
 * incoming signal is queued and processed after the current step completes.
 * This prevents stack corruption and ensures deterministic ordering.
 *
 * Jokers: a transition may use a reserved "joker" string (default '*',
 * configurable via SfsmOptions.jokerSignal / jokerState) in its signal or
 * from-state slot to act as a fallback. A joker-signal transition matches
 * any signal for its from-state; a joker-state transition matches any
 * from-state for its signal. Exact, literal transitions always take
 * priority over joker matches. See docs/Tutorial/Tutorial.md for examples.
 *
 * Entry/exit naming convention: every FA's entry state is either the bare
 * "I", or a namespaced "<FaName>.I" (e.g. "TS.I") — auto-detected per FA from
 * its own transitions. Every exit state either starts with "E_", or contains
 * ".E_" (e.g. "TS.E_ok"). Both forms are recognised everywhere and may be
 * freely mixed across FAs; see Tutorial.md §8.1 for when to use the
 * namespaced form.
 */
export declare class Sfsm implements ISignalReceiver {
    private resolver;
    private stack;
    private commandReceiver;
    private options;
    private log;
    private processing;
    private signalQueue;
    /**
     * Create a new SFSM instance. If a model is provided, it is loaded immediately.
     * @param model The FA definition or path to JSON-file or URLwith model to load initially, or null.
     * @param options Configuration options for the SFSM instance.
     */
    constructor(model: FaDefinition | null, options?: SfsmOptions);
    /** Register the single command receiver for this SFSM instance. */
    setCommandReceiver(receiver: ICommandReceiver): void;
    /**
     * Load a FA definition and initialise the engine.
     * The root FA is pushed onto the stack with active state "I".
     * No signal is sent automatically — the caller is responsible for
     * sending the first signal (e.g. "TS>start") to drive out of state I.
     */
    loadFA(definition: FaDefinition): void;
    /**
     * Send a signal to the SFSM.
     * If called re-entrantly (from within a command receiver), the signal
     * is queued and will be processed after the current step finishes.
     */
    receiveSignal(signal: string, data?: unknown): void;
    /** Returns the accumulated log entries. */
    getLog(): LogEntry[];
    /** Returns the current FA name stack (bottom = index 0, head = last). */
    getCurrentStack(): string[];
    /** Returns the active state of the head FA. */
    getHeadState(): string;
    private processSignal;
    /**
     * Rule 2: find a matching transition, searching from head down the stack.
     * Returns { frameIndex, transition } or null if not found anywhere.
     *
     * Within each frame, matches are tried in priority order so that exact,
     * literal transitions always win over joker (wildcard) ones:
     *   1. exact from-state + exact signal
     *   2. exact from-state + joker signal
     *   3. joker from-state + exact signal
     *   4. joker from-state + joker signal
     */
    private findTransition;
    private applySignal;
    /**
     * A state is an exit/final state if it starts with "E_" (default
     * convention) or contains ".E_" (namespaced convention, e.g. "TS.E_ok").
     */
    private isExitState;
    private resolveStateMeta;
    private resolveSignalMeta;
    private resolveCommandMeta;
    private handleMissingTransition;
    private handleMissingData;
}
//# sourceMappingURL=Sfsm.d.ts.map