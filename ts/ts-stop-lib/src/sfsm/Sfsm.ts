import { FaDefinition, LogEntry, SfsmOptions } from './types';
import { ICommandReceiver, ISignalReceiver } from './interfaces';
import { FaResolver } from './tools/FaResolver';

interface StackFrame {
    faName: string;
    currentState: string;
}

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
export class Sfsm implements ISignalReceiver {

    private resolver: FaResolver | null = null;
    private stack: StackFrame[] = [];
    private commandReceiver: ICommandReceiver | null = null;
    private options: SfsmOptions;
    private log: LogEntry[] = [];
    private processing = false;
    private signalQueue: Array<{ signal: string; data?: unknown }> = [];

    /**
     * Create a new SFSM instance. If a model is provided, it is loaded immediately.
     * @param model The FA definition or path to JSON-file or URLwith model to load initially, or null.
     * @param options Configuration options for the SFSM instance.  
     */
    constructor(model: FaDefinition | null, options: SfsmOptions = {}) {
        this.options = {
            byMissingData: options.byMissingData ?? 'error',
            byMissingTransition: options.byMissingTransition ?? 'error',
            jokerSignal: options.jokerSignal ?? '*',
            jokerState: options.jokerState ?? '*'
        };

        if (model) {
            this.loadFA(model as FaDefinition);
        }
    }

    /** Register the single command receiver for this SFSM instance. */
    setCommandReceiver(receiver: ICommandReceiver): void {
        this.commandReceiver = receiver;
    }

    /**
     * Load a FA definition and initialise the engine.
     * The root FA is pushed onto the stack with active state "I".
     * No signal is sent automatically — the caller is responsible for
     * sending the first signal (e.g. "TS>start") to drive out of state I.
     */
    loadFA(definition: FaDefinition): void {
        this.resolver = new FaResolver(definition);
        const rootName = this.resolver.getRootName();
        this.stack = [{ faName: rootName, currentState: this.resolver.get(rootName).entryState }];
        this.log = [];
        this.processing = false;
        this.signalQueue = [];
    }

    /**
     * Send a signal to the SFSM.
     * If called re-entrantly (from within a command receiver), the signal
     * is queued and will be processed after the current step finishes.
     */
    receiveSignal(signal: string, data?: unknown): void {
        if (this.processing) {
            this.signalQueue.push({ signal, data });
            return;
        }
        this.processSignal(signal, data);
        // Drain queue
        while (this.signalQueue.length > 0) {
            const next = this.signalQueue.shift()!;
            this.processSignal(next.signal, next.data);
        }
    }

    /** Returns the accumulated log entries. */
    getLog(): LogEntry[] {
        return [...this.log];
    }

    /** Returns the current FA name stack (bottom = index 0, head = last). */
    getCurrentStack(): string[] {
        return this.stack.map(f => f.faName);
    }

    /** Returns the active state of the head FA. */
    getHeadState(): string {
        if (this.stack.length === 0) throw new Error('SFSM: not initialised');
        return this.stack[this.stack.length - 1].currentState;
    }

    // ── Core engine ─────────────────────────────────────────────────────────

    private processSignal(signal: string, data?: unknown): void {
        if (!this.resolver || this.stack.length === 0) {
            throw new Error('SFSM: call loadFA() before sending signals');
        }

        this.processing = true;
        try {
            this.applySignal(signal, data);
        } finally {
            this.processing = false;
        }
    }

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
    private findTransition(signal: string): { frameIndex: number; toState: string; command?: string } | null {
        const jokerSignal = this.options.jokerSignal;
        const jokerState = this.options.jokerState;

        for (let i = this.stack.length - 1; i >= 0; i--) {
            const frame = this.stack[i];
            const fa = this.resolver!.get(frame.faName);

            let match = fa.transitions.find(
                t => t[0] === frame.currentState && t[1] === signal
            );

            if (!match && jokerSignal !== undefined) {
                match = fa.transitions.find(
                    t => t[0] === frame.currentState && t[1] === jokerSignal
                );
            }

            if (!match && jokerState !== undefined) {
                match = fa.transitions.find(
                    t => t[0] === jokerState && t[1] === signal
                );
            }

            if (!match && jokerState !== undefined && jokerSignal !== undefined) {
                match = fa.transitions.find(
                    t => t[0] === jokerState && t[1] === jokerSignal
                );
            }

            if (match) {
                return { frameIndex: i, toState: match[2], command: match[3] };
            }
        }
        return null;
    }

    private applySignal(signal: string, data?: unknown): void {
        const result = this.findTransition(signal);

        if (!result) {
            // Rule 2.2.1 — no transition found anywhere
            this.handleMissingTransition(signal);
            return;
        }

        const { frameIndex, toState, command } = result;

        // Capture stack state BEFORE any structural changes
        const stackBefore = this.getCurrentStack();
        const stateBefore = this.stack[frameIndex].currentState;
        // Bubble-up: signal was handled by an ancestor FA, not the head
        const bubbledUp = frameIndex < this.stack.length - 1;

        // Rule 2.2.2.1 — pop frames above the matched FA
        if (bubbledUp) {
            this.stack.splice(frameIndex + 1);
        }

        // Update state
        this.stack[frameIndex].currentState = toState;

        // Rule label: 2.1 = head FA handled signal; 2.2.2.1 = ancestor handled after bubble-up
        const rule = bubbledUp ? '2.2.2.1' : '2.1';

        // Rule 2.1.1 — send command if present
        let sentCommand: string | undefined;
        let commandName: string | undefined;
        let receiver: string | undefined;

        if (command) {
            sentCommand = command;
            const meta = this.resolveCommandMeta(frameIndex, command);
            commandName = meta?.name;
            receiver = meta?.receiver;
            const commandData = command.endsWith('$') ? data : undefined;
            if (command.endsWith('$') && data === undefined) {
                this.handleMissingData(signal, command);
            }
            this.commandReceiver?.receiveCommand(command, commandData);
        }

        const logEntry: LogEntry = {
            step: this.log.length + 1,
            stack: stackBefore,
            state: stateBefore,
            stateName: this.resolveStateMeta(frameIndex, stateBefore)?.name,
            signal,
            signalName: this.resolveSignalMeta(frameIndex, signal)?.name,
            rule,
            newStack: this.getCurrentStack(),
            newState: toState,
            newStateName: this.resolveStateMeta(frameIndex, toState)?.name,
            command: sentCommand,
            commandName,
            receiver
        };
        this.log.push(logEntry);

        // Rule 4: new state is itself a sub-FA — push it
        const headFa = this.resolver!.get(this.stack[frameIndex].faName);
        if (headFa.subFaNames.has(toState)) {
            this.stack.push({ faName: toState, currentState: this.resolver!.get(toState).entryState });
            this.applySignal(signal, data);  // forward signal to sub-FA
            return;
        }

        // Rule 5: new state is an exit state
        if (this.isExitState(toState)) {
            if (this.stack.length === 1) {
                // Rule 5.1 — root FA resets to I
                this.stack[0].currentState = this.resolver!.get(this.stack[0].faName).entryState;
            } else {
                // Rule 5.2 — pop current FA, forward signal to new head
                this.stack.pop();
                this.applySignal(signal, data);
            }
        }
    }

    // ── Meta resolution helpers ──────────────────────────────────────────────

    /**
     * A state is an exit/final state if it starts with "E_" (default
     * convention) or contains ".E_" (namespaced convention, e.g. "TS.E_ok").
     */
    private isExitState(state: string): boolean {
        return state.startsWith('E_') || state.includes('.E_');
    }

    private resolveStateMeta(frameIndex: number, state: string) {
        const fa = this.resolver!.get(this.stack[frameIndex].faName);
        return fa.node.states?.[state] as { name?: string } | undefined;
    }

    private resolveSignalMeta(frameIndex: number, signal: string) {
        // Search from head FA downward for signal metadata
        for (let i = this.stack.length - 1; i >= 0; i--) {
            const fa = this.resolver!.get(this.stack[i].faName);
            if (fa.node.signals?.[signal]) return fa.node.signals[signal];
        }
        return undefined;
    }

    private resolveCommandMeta(frameIndex: number, command: string) {
        for (let i = this.stack.length - 1; i >= 0; i--) {
            const fa = this.resolver!.get(this.stack[i].faName);
            if (fa.node.commands?.[command]) return fa.node.commands[command];
        }
        return undefined;
    }

    // ── Policy handlers ──────────────────────────────────────────────────────

    private handleMissingTransition(signal: string): void {
        const policy = this.options.byMissingTransition ?? 'error';
        const msg = `SFSM: no transition for signal "${signal}" in state "${this.getHeadState()}" (FA: ${this.getCurrentStack().join('>')})`;
        if (policy === 'error') throw new Error(msg);
        if (policy === 'log_warning') console.warn(msg);
        // 'ignore': do nothing
    }

    private handleMissingData(signal: string, command: string): void {
        const policy = this.options.byMissingData ?? 'error';
        const msg = `SFSM: command "${command}" expects data but signal "${signal}" carries none`;
        if (policy === 'error') throw new Error(msg);
        if (policy === 'log_warning') console.warn(msg);
    }
}
