import { Sfsm } from '../../src/sfsm/Sfsm';
import { FaDefinition } from '../../src/sfsm/types';
import { ICommandReceiver } from '../../src/sfsm/interfaces';

/**
 * Minimal ICommandReceiver that records every command received.
 *
 * The SFSM engine itself does not depend on ControllerHub or any other
 * higher-level class — it only needs an object that satisfies the
 * ICommandReceiver interface. Using this lightweight recorder keeps the
 * tests focused on the engine's own behaviour.
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
 * Embedded SFSM definitions used across the core engine tests.
 *
 * The turnstile FA below is a small but complete example: it uses the
 * extended FaNode format with states, signals, commands and ts, and it
 * exercises the entry/exit-state convention (state `I` is the entry state,
 * `E_ok` is an exit state).
 */
const turnstileFa: FaDefinition = {
    Turnstile: {
        states: {
            'I': { name: 'Initial' },
            'Locked': { name: 'Locked' },
            'Unlocked': { name: 'Unlocked' },
            'E_ok': { name: 'Ok' }
        },
        signals: {
            'coin': { name: 'Coin inserted' },
            'push': { name: 'Push' },
            'reset': { name: 'Reset' }
        },
        commands: {
            'lock': { name: 'Lock', receiver: 'TurnstileController' },
            'unlock': { name: 'Unlock', receiver: 'TurnstileController' }
        },
        ts: [
            ['I', 'coin', 'Unlocked'],
            ['I', 'push', 'Locked'],
            ['Locked', 'coin', 'Unlocked', 'unlock'],
            ['Unlocked', 'push', 'Locked', 'lock'],
            ['Locked', 'reset', 'E_ok'],
            ['Unlocked', 'reset', 'E_ok']
        ]
    }
};

/**
 * Embedded stacked SFSM: a parent FA whose state `Child` is itself a sub-FA
 * (it has its own `ts` array). The child has its own entry/exit states so
 * that the push/pop mechanics of the SFSM stack can be exercised without
 * any external resources.
 *
 * In the extended FaNode format, a state entry is treated as a sub-FA when
 * its value is an object containing a `ts` array; otherwise it is a leaf
 * state (an ElementMeta with just a name/description).
 *
 * Note: when the engine pushes a sub-FA, it forwards the very same signal
 * into it (Rule 4 in the tutorial). That is why `Child` has a transition
 * from `I` on `start` — the `start` signal that triggers the push is the
 * one that drives Child out of its entry state.
 */
const stackedFa: FaDefinition = {
    Parent: {
        states: {
            'I': { name: 'Initial' },
            'Done': { name: 'Done' },
            'Child': {
                states: {
                    'I': { name: 'Child initial' },
                    'Working': { name: 'Working' },
                    'E_done': { name: 'Child done' }
                },
                signals: {
                    'start': { name: 'Start' },
                    'work': { name: 'Work' },
                    'finish': { name: 'Finish' }
                },
                ts: [
                    ['I', 'start', 'Working'],
                    ['Working', 'work', 'Working'],
                    ['Working', 'finish', 'E_done']
                ]
            }
        },
        signals: {
            'start': { name: 'Start' },
            'work': { name: 'Work' },
            'finish': { name: 'Finish' }
        },
        ts: [
            ['I', 'start', 'Child'],
            ['Child', 'finish', 'Done']
        ]
    }
};

describe('Sfsm core engine', () => {

    describe('initialisation', () => {
        test('loadFA activates the root FA at its entry state', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(turnstileFa);

            expect(sfsm.getCurrentStack()).toEqual(['Turnstile']);
            expect(sfsm.getHeadState()).toBe('I');
        });

        test('loadFA resets the log and the signal queue', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(turnstileFa);
            sfsm.receiveSignal('coin');

            sfsm.loadFA(turnstileFa);

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
            sfsm.loadFA(turnstileFa);
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

        test('a transition with a $ command forwards signal data to the receiver', () => {
            // Use a dedicated FA whose command carries the $ suffix, which
            // tells the engine to forward the signal's data to the receiver.
            const fa: FaDefinition = {
                DataTurnstile: {
                    states: {
                        'I': { name: 'Initial' },
                        'Locked': { name: 'Locked' },
                        'Unlocked': { name: 'Unlocked' }
                    },
                    signals: {
                        'coin': { name: 'Coin inserted' },
                        'push': { name: 'Push' }
                    },
                    commands: {
                        'lock$': { name: 'Lock', receiver: 'TurnstileController' }
                    },
                    ts: [
                        ['I', 'coin', 'Unlocked'],
                        ['Unlocked', 'push', 'Locked', 'lock$']
                    ]
                }
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

        test('a transition with a no-$ command does not forward data', () => {
            const fa: FaDefinition = {
                NoArg: {
                    states: { 'I': { name: 'Initial' }, 'A': { name: 'A' } },
                    signals: { 'go': { name: 'Go' } },
                    commands: { 'ping': { name: 'Ping', receiver: 'PingController' } },
                    ts: [['I', 'go', 'A', 'ping']]
                }
            };
            const local = new Sfsm();
            const rec = new RecordingReceiver();
            local.setCommandReceiver(rec);
            local.loadFA(fa);

            local.receiveSignal('go', { payload: 1 });

            expect(rec.calls).toEqual([{ command: 'ping', data: undefined }]);
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
            sfsm.loadFA(turnstileFa);

            sfsm.receiveSignal('coin');    // I -> Unlocked
            sfsm.receiveSignal('reset');   // Unlocked -> E_ok -> root resets to I

            expect(sfsm.getCurrentStack()).toEqual(['Turnstile']);
            expect(sfsm.getHeadState()).toBe('I');
        });

        test('reaching an exit state on a non-root FA pops it and forwards the signal', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(stackedFa);

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
            sfsm.loadFA(stackedFa);

            sfsm.receiveSignal('start');

            // Child is pushed and the 'start' signal is forwarded into it,
            // driving it from I to Working.
            expect(sfsm.getCurrentStack()).toEqual(['Parent', 'Child']);
            expect(sfsm.getHeadState()).toBe('Working');
        });

        test('signals are forwarded to the head of the stack after a push', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(stackedFa);

            sfsm.receiveSignal('start');   // push Child, Child.I -> Working
            sfsm.receiveSignal('work');    // Child.Working -> Working (self-loop)

            expect(sfsm.getHeadState()).toBe('Working');
            expect(sfsm.getCurrentStack()).toEqual(['Parent', 'Child']);
        });
    });

    describe('bubble-up (rule 2.2.2.1)', () => {
        test('a signal handled by an ancestor FA pops the frames above it', () => {
            // Build a stacked FA where the parent can handle a signal that
            // the child has no transition for, so the signal bubbles up.
            // The child must handle 'start' (the push-trigger signal) so
            // that the push itself does not fail.
            const fa: FaDefinition = {
                Parent: {
                    states: {
                        'I': { name: 'Initial' },
                        'Cancelled': { name: 'Cancelled' },
                        'Child': {
                            states: {
                                'I': { name: 'Child initial' },
                                'Working': { name: 'Working' }
                            },
                            signals: {
                                'start': { name: 'Start' },
                                'work': { name: 'Work' }
                            },
                            ts: [
                                ['I', 'start', 'Working'],
                                ['Working', 'work', 'Working']
                            ]
                        }
                    },
                    signals: {
                        'start': { name: 'Start' },
                        'cancel': { name: 'Cancel' }
                    },
                    ts: [
                        ['I', 'start', 'Child'],
                        ['Child', 'cancel', 'Cancelled']
                    ]
                }
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
            Strict: {
                states: { 'I': { name: 'Initial' }, 'A': { name: 'A' } },
                signals: { 'go': { name: 'Go' } },
                ts: [['I', 'go', 'A']]
            }
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
            Data: {
                states: { 'I': { name: 'Initial' }, 'A': { name: 'A' } },
                signals: { 'go': { name: 'Go' } },
                commands: { 'ping$': { name: 'Ping', receiver: 'PingController' } },
                ts: [['I', 'go', 'A', 'ping$']]
            }
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
                Reentrant: {
                    states: {
                        'I': { name: 'Initial' },
                        'A': { name: 'A' },
                        'B': { name: 'B' }
                    },
                    signals: {
                        'go': { name: 'Go' },
                        'next': { name: 'Next' }
                    },
                    commands: { 'step$': { name: 'Step', receiver: 'ReentrantController' } },
                    ts: [
                        ['I', 'go', 'A', 'step$'],
                        ['A', 'next', 'B']
                    ]
                }
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
            sfsm.loadFA(stackedFa);

            expect(sfsm.getCurrentStack()).toEqual(['Parent']);
            sfsm.receiveSignal('start');
            expect(sfsm.getCurrentStack()).toEqual(['Parent', 'Child']);
        });
    });
});