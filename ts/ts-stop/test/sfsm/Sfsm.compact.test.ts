import { Sfsm } from '../../src/sfsm/Sfsm';
import { FaDefinition, Transition } from '../../src/sfsm/types';
import { ICommandReceiver } from '../../src/sfsm/interfaces';

/**
 * Sfsm compact-format tests.
 *
 * These tests exercise the SFSM engine in isolation (no ControllerHub, no
 * external simulators) using embedded FA definitions in the compact
 * multi-FA format: `Record<string, Transition[]>`, where each FA is just a
 * list of transitions and the engine auto-detects the root FA as the one
 * whose name is never a transition target in any other FA.
 *
 * Because the compact format carries no metadata, log entries produced
 * from these FAs do NOT populate the human-readable name fields
 * (stateName, signalName, commandName, receiver) — that is verified
 * explicitly in the "log metadata" tests below.
 */

/**
 * Minimal ICommandReceiver that records every command received.
 */
class RecordingReceiver implements ICommandReceiver {
    public calls: Array<{ command: string; data?: unknown }> = [];

    receiveCommand(command: string, data?: unknown): void {
        this.calls.push({ command, data });
    }

    reset(): void {
        this.calls = [];
    }
}

/**
 * Embedded compact turnstile FA (single FA, no sub-FAs).
 *
 * The root FA is `Turnstile` — its name is the only key, so it is
 * auto-detected as the root. State `I` is the entry state, `E_ok` is an
 * exit state. Commands `lock`/`unlock` have no `$` suffix, so they do
 * not require signal data.
 */
const turnstileCompactFa: FaDefinition = {
    Turnstile: [
        ['I', 'coin', 'Unlocked'],
        ['I', 'push', 'Locked'],
        ['Locked', 'coin', 'Unlocked', 'unlock'],
        ['Unlocked', 'push', 'Locked', 'lock'],
        ['Locked', 'reset', 'E_ok'],
        ['Unlocked', 'reset', 'E_ok']
    ] as Transition[]
};

/**
 * Embedded compact stacked FA: a parent `Parent` whose state `Child` is a
 * sub-FA (because `Child` is also a top-level key). The engine auto-detects
 * `Parent` as the root because `Parent` is never a transition target in
 * any other FA, while `Child` is a target in `Parent`'s transitions.
 *
 * Note: when the engine pushes a sub-FA, it forwards the very same signal
 * into it (Rule 4 in the tutorial). That is why `Child` has a transition
 * from `I` on `start` — the `start` signal that triggers the push is the
 * one that drives Child out of its entry state.
 */
const stackedCompactFa: FaDefinition = {
    Parent: [
        ['I', 'start', 'Child'],
        ['Child', 'finish', 'Done']
    ] as Transition[],
    Child: [
        ['I', 'start', 'Working'],
        ['Working', 'work', 'Working'],
        ['Working', 'finish', 'E_done']
    ] as Transition[]
};

describe('Sfsm compact-format engine', () => {

    describe('initialisation', () => {
        test('loadFA activates the root FA at its entry state', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(turnstileCompactFa);

            expect(sfsm.getCurrentStack()).toEqual(['Turnstile']);
            expect(sfsm.getHeadState()).toBe('I');
        });

        test('loadFA resets the log and the signal queue', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(turnstileCompactFa);
            sfsm.receiveSignal('coin');

            sfsm.loadFA(turnstileCompactFa);

            expect(sfsm.getLog()).toEqual([]);
            expect(sfsm.getCurrentStack()).toEqual(['Turnstile']);
            expect(sfsm.getHeadState()).toBe('I');
        });

        test('getHeadState throws when the engine has not been initialised', () => {
            const sfsm = new Sfsm();
            expect(() => sfsm.getHeadState()).toThrow(/not initialised/);
        });

        test('receiveSignal throws before loadFA is called', () => {
            const sfsm = new Sfsm();
            expect(() => sfsm.receiveSignal('coin')).toThrow(/loadFA/);
        });
    });

    describe('single-FA transitions (rule 2.1)', () => {
        let sfsm: Sfsm;
        let receiver: RecordingReceiver;

        beforeEach(() => {
            sfsm = new Sfsm();
            receiver = new RecordingReceiver();
            sfsm.setCommandReceiver(receiver);
            sfsm.loadFA(turnstileCompactFa);
        });

        test('a signal handled by the head FA advances its state', () => {
            sfsm.receiveSignal('coin');

            expect(sfsm.getHeadState()).toBe('Unlocked');
            expect(sfsm.getCurrentStack()).toEqual(['Turnstile']);
        });

        test('a transition without a command does not invoke the receiver', () => {
            sfsm.receiveSignal('coin');
            expect(receiver.calls).toEqual([]);
        });

        test('a transition with a no-$ command fires the command without data', () => {
            sfsm.receiveSignal('coin');   // I -> Unlocked
            sfsm.receiveSignal('push');   // Unlocked -> Locked, fires lock

            expect(sfsm.getHeadState()).toBe('Locked');
            expect(receiver.calls).toHaveLength(1);
            expect(receiver.calls[0]).toEqual({
                command: 'lock',
                data: undefined
            });
        });

        test('a transition with a $ command forwards signal data to the receiver', () => {
            // Use a dedicated compact FA whose command carries the $ suffix.
            const fa: FaDefinition = {
                DataTurnstile: [
                    ['I', 'coin', 'Unlocked'],
                    ['Unlocked', 'push', 'Locked', 'lock$']
                ] as Transition[]
            };
            const local = new Sfsm();
            const rec = new RecordingReceiver();
            local.setCommandReceiver(rec);
            local.loadFA(fa);

            local.receiveSignal('coin');   // I -> Unlocked
            local.receiveSignal('push', { who: 'visitor' }); // Unlocked -> Locked, fires lock$

            expect(local.getHeadState()).toBe('Locked');
            expect(rec.calls).toHaveLength(1);
            expect(rec.calls[0]).toEqual({
                command: 'lock$',
                data: { who: 'visitor' }
            });
        });

        test('multiple signals drive the FA through a sequence of states', () => {
            sfsm.receiveSignal('coin');   // I -> Unlocked
            sfsm.receiveSignal('push');   // Unlocked -> Locked
            sfsm.receiveSignal('coin');   // Locked -> Unlocked

            expect(sfsm.getHeadState()).toBe('Unlocked');
            expect(sfsm.getLog().map(e => e.newState)).toEqual([
                'Unlocked', 'Locked', 'Unlocked'
            ]);
        });
    });

    describe('exit states (rule 5)', () => {
        test('reaching an exit state on the root FA resets it to the entry state', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(turnstileCompactFa);

            sfsm.receiveSignal('coin');    // I -> Unlocked
            sfsm.receiveSignal('reset');   // Unlocked -> E_ok -> root resets to I

            expect(sfsm.getCurrentStack()).toEqual(['Turnstile']);
            expect(sfsm.getHeadState()).toBe('I');
        });

        test('reaching an exit state on a non-root FA pops it and forwards the signal', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(stackedCompactFa);

            // Push the child FA onto the stack. The 'start' signal is
            // forwarded into Child, driving it from I to Working.
            sfsm.receiveSignal('start');   // Parent.I -> Child (push), Child.I -> Working
            expect(sfsm.getCurrentStack()).toEqual(['Parent', 'Child']);
            expect(sfsm.getHeadState()).toBe('Working');

            // Drive the child to its exit state. Rule 5.2 pops Child and
            // forwards the signal to the new head (Parent), which has a
            // transition Child -> Done on signal 'finish'.
            sfsm.receiveSignal('finish');  // Child.Working -> E_done -> pop -> Parent.Child -> Done

            expect(sfsm.getCurrentStack()).toEqual(['Parent']);
            expect(sfsm.getHeadState()).toBe('Done');
        });
    });

    describe('stacked FAs (rule 4 — push sub-FA)', () => {
        test('transitioning to a sub-FA state pushes the sub-FA onto the stack', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(stackedCompactFa);

            sfsm.receiveSignal('start');

            // Child is pushed and the 'start' signal is forwarded into it,
            // driving it from I to Working.
            expect(sfsm.getCurrentStack()).toEqual(['Parent', 'Child']);
            expect(sfsm.getHeadState()).toBe('Working');
        });

        test('signals are forwarded to the head of the stack after a push', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(stackedCompactFa);

            sfsm.receiveSignal('start');   // push Child, Child.I -> Working
            sfsm.receiveSignal('work');    // Child.Working -> Working (self-loop)

            expect(sfsm.getHeadState()).toBe('Working');
            expect(sfsm.getCurrentStack()).toEqual(['Parent', 'Child']);
        });
    });

    describe('bubble-up (rule 2.2.2.1)', () => {
        test('a signal handled by an ancestor FA pops the frames above it', () => {
            // Build a compact stacked FA where the parent can handle a
            // signal that the child has no transition for, so the signal
            // bubbles up. The child must handle 'start' (the push-trigger
            // signal) so that the push itself does not fail.
            const fa: FaDefinition = {
                Parent: [
                    ['I', 'start', 'Child'],
                    ['Child', 'cancel', 'Cancelled']
                ] as Transition[],
                Child: [
                    ['I', 'start', 'Working'],
                    ['Working', 'work', 'Working']
                ] as Transition[]
            };
            const sfsm = new Sfsm();
            sfsm.loadFA(fa);

            sfsm.receiveSignal('start');   // push Child, Child.I -> Working
            expect(sfsm.getCurrentStack()).toEqual(['Parent', 'Child']);
            expect(sfsm.getHeadState()).toBe('Working');

            // 'cancel' is not defined on Child, so it bubbles up to Parent.
            sfsm.receiveSignal('cancel');

            expect(sfsm.getCurrentStack()).toEqual(['Parent']);
            expect(sfsm.getHeadState()).toBe('Cancelled');
        });
    });

    describe('missing-transition policy', () => {
        const fa: FaDefinition = {
            Strict: [
                ['I', 'go', 'A']
            ] as Transition[]
        };

        test('default policy throws on a missing transition', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(fa);
            expect(() => sfsm.receiveSignal('unknown')).toThrow(/no transition/);
        });

        test('log_warning policy warns and leaves the state untouched', () => {
            const sfsm = new Sfsm({ byMissingTransition: 'log_warning' });
            sfsm.loadFA(fa);

            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            sfsm.receiveSignal('unknown');
            warnSpy.mockRestore();

            expect(sfsm.getHeadState()).toBe('I');
            expect(sfsm.getLog()).toEqual([]);
        });

        test('ignore policy silently drops the signal', () => {
            const sfsm = new Sfsm({ byMissingTransition: 'ignore' });
            sfsm.loadFA(fa);

            sfsm.receiveSignal('unknown');

            expect(sfsm.getHeadState()).toBe('I');
            expect(sfsm.getLog()).toEqual([]);
        });
    });

    describe('missing-data policy', () => {
        const fa: FaDefinition = {
            Data: [
                ['I', 'go', 'A', 'ping$']
            ] as Transition[]
        };

        test('default policy throws when a $ command receives no data', () => {
            const sfsm = new Sfsm();
            const rec = new RecordingReceiver();
            sfsm.setCommandReceiver(rec);
            sfsm.loadFA(fa);

            expect(() => sfsm.receiveSignal('go')).toThrow(/expects data/);
        });

        test('log_warning policy warns but still fires the command', () => {
            const sfsm = new Sfsm({ byMissingData: 'log_warning' });
            const rec = new RecordingReceiver();
            sfsm.setCommandReceiver(rec);
            sfsm.loadFA(fa);

            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            sfsm.receiveSignal('go');
            warnSpy.mockRestore();

            expect(rec.calls).toHaveLength(1);
            expect(rec.calls[0].command).toBe('ping$');
            expect(rec.calls[0].data).toBeUndefined();
        });

        test('ignore policy silently fires the command without data', () => {
            const sfsm = new Sfsm({ byMissingData: 'ignore' });
            const rec = new RecordingReceiver();
            sfsm.setCommandReceiver(rec);
            sfsm.loadFA(fa);

            sfsm.receiveSignal('go');

            expect(rec.calls).toHaveLength(1);
            expect(rec.calls[0].data).toBeUndefined();
        });
    });

    describe('signal re-entrancy', () => {
        test('signals queued from within a command receiver are processed in order', () => {
            // The transition I -> A fires a command. The receiver re-enters
            // the engine with a second signal while processing is still
            // active; that second signal must be queued and processed
            // after the current step finishes.
            const fa: FaDefinition = {
                Reentrant: [
                    ['I', 'go', 'A', 'step$'],
                    ['A', 'next', 'B']
                ] as Transition[]
            };

            const sfsm = new Sfsm();
            const rec = new RecordingReceiver();
            sfsm.setCommandReceiver(rec);
            sfsm.loadFA(fa);

            // The receiver re-enters the engine with 'next' while 'go' is
            // still being processed.
            rec.receiveCommand = (_command: string, _data?: unknown) => {
                sfsm.receiveSignal('next');
            };

            sfsm.receiveSignal('go', { n: 1 });

            expect(sfsm.getHeadState()).toBe('B');
            expect(sfsm.getLog().map(e => e.signal)).toEqual(['go', 'next']);
        });
    });

    describe('stack inspection', () => {
        test('getCurrentStack returns the FA names from bottom to head', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(stackedCompactFa);

            expect(sfsm.getCurrentStack()).toEqual(['Parent']);
            sfsm.receiveSignal('start');
            expect(sfsm.getCurrentStack()).toEqual(['Parent', 'Child']);
        });
    });

    describe('log metadata (compact format)', () => {
        test('compact log entries do not populate the human-readable name fields', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(turnstileCompactFa);

            sfsm.receiveSignal('coin');   // I -> Unlocked
            sfsm.receiveSignal('push');   // Unlocked -> Locked, fires lock

            const log = sfsm.getLog();
            expect(log).toHaveLength(2);

            // Compact format carries no metadata, so all name fields are
            // undefined — even though the FA does fire a command.
            const pushEntry = log[1];
            expect(pushEntry.command).toBe('lock');
            expect(pushEntry.stateName).toBeUndefined();
            expect(pushEntry.signalName).toBeUndefined();
            expect(pushEntry.newStateName).toBeUndefined();
            expect(pushEntry.commandName).toBeUndefined();
            expect(pushEntry.receiver).toBeUndefined();
        });

        test('first log entry has correct stack and signal after start', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(turnstileCompactFa);

            sfsm.receiveSignal('coin');
            const log = sfsm.getLog();
            expect(log[0].signal).toBe('coin');
            expect(log[0].stack).toEqual(['Turnstile']);
            expect(log[0].state).toBe('I');
            expect(log[0].newState).toBe('Unlocked');
            expect(log[0].rule).toBe('2.1');
        });
    });
});