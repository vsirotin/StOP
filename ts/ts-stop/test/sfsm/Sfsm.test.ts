import { Sfsm } from '../../src/sfsm/Sfsm';
import { FaDefinition } from '../../src/sfsm/types';
import { ICommandReceiver } from '../../src/sfsm/interfaces';
import { RecordingReceiver } from './RecordingReceiver';

/**
 * Sfsm core engine tests.
 *
 * These tests exercise the SFSM engine in isolation (no TransceiverHub, no
 * external simulators) using embedded FA definitions in the extended
 * FaNode format. They cover: initialisation, single-FA transitions
 * (rule 2.1), exit states (rule 5), stacked FAs (rule 4 push/pop),
 * bubble-up (rule 2.2.2.1), missing-transition/missing-data policies,
 * signal re-entrancy, $-suffix data forwarding, and stack inspection.
 */


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

/**
 * Embedded 3-level stacked SFSM (A → B → C) used to verify that sub-FAs
 * always re-enter at their entry state `I` when pushed again after being
 * popped. This is the "deep push/pop cycle" fixture.
 *
 * Hierarchy:
 *   A has state `B` which is a sub-FA.
 *   B has state `C` which is a sub-FA (nested inside B).
 *
 * The deep cycle (one iteration):
 *   1. enterB  — A:I → B (push B), B:I → B:Working (forwarded enterB)
 *   2. enterC  — B:Working → C (push C), C:I → C:Working (forwarded enterC)
 *   3. finishC — C:Working → C:E_done (pop C), B:C → B:Working (forwarded finishC)
 *   4. enterC  — B:Working → C (push C again), C:I → C:Working (forwarded enterC)
 *   5. finishC — C:Working → C:E_done (pop C), B:C → B:Working (forwarded finishC)
 *   6. finishB — B:Working → B:E_done (pop B), A:B → A:I (forwarded finishB)
 *
 * After step 6, A is back at I and the cycle can repeat. Steps 4 and 1
 * (of the next cycle) are the key assertions: if C or B did not reset to
 * I on re-push, the forwarded signal would find no matching transition
 * and the engine would throw.
 */
const deepStackedFa: FaDefinition = {
    A: {
        states: {
            'I': { name: 'A initial' },
            'B': {
                states: {
                    'I': { name: 'B initial' },
                    'Working': { name: 'B working' },
                    'C': {
                        states: {
                            'I': { name: 'C initial' },
                            'Working': { name: 'C working' },
                            'E_done': { name: 'C done' }
                        },
                        signals: {
                            'enterC': { name: 'Enter C' },
                            'finishC': { name: 'Finish C' }
                        },
                        ts: [
                            ['I', 'enterC', 'Working'],
                            ['Working', 'finishC', 'E_done']
                        ]
                    },
                    'E_done': { name: 'B done' }
                },
                signals: {
                    'enterB': { name: 'Enter B' },
                    'enterC': { name: 'Enter C' },
                    'finishC': { name: 'Finish C' },
                    'finishB': { name: 'Finish B' }
                },
                ts: [
                    ['I', 'enterB', 'Working'],
                    ['Working', 'enterC', 'C'],
                    ['C', 'finishC', 'Working'],
                    ['Working', 'finishB', 'E_done']
                ]
            }
        },
        signals: {
            'enterB': { name: 'Enter B' },
            'finishB': { name: 'Finish B' }
        },
        ts: [
            ['I', 'enterB', 'B'],
            ['B', 'finishB', 'I']
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

    describe('repeated deep push/pop cycles', () => {
        test('re-entering a sub-FA always starts at its entry state, even after multiple cycles', () => {
            const sfsm = new Sfsm();
            sfsm.loadFA(deepStackedFa);

            // Run the deep cycle 3 times. Each cycle pushes B and C onto
            // the stack, pops C, re-pushes C (which MUST reset to I), pops
            // C again, then pops B — leaving A back at I for the next cycle.
            for (let cycle = 1; cycle <= 3; cycle++) {
                // Step 1: enterB — push B, B starts at I, forwarded enterB drives B to Working
                sfsm.receiveSignal('enterB');
                expect(sfsm.getCurrentStack()).toEqual(['A', 'B']);
                expect(sfsm.getHeadState()).toBe('Working');

                // Step 2: enterC — push C, C starts at I, forwarded enterC drives C to Working
                sfsm.receiveSignal('enterC');
                expect(sfsm.getCurrentStack()).toEqual(['A', 'B', 'C']);
                expect(sfsm.getHeadState()).toBe('Working');

                // Step 3: finishC — C exits, pops, B returns to Working
                sfsm.receiveSignal('finishC');
                expect(sfsm.getCurrentStack()).toEqual(['A', 'B']);
                expect(sfsm.getHeadState()).toBe('Working');

                // Step 4: enterC again — C is re-pushed and MUST start at I again.
                // If C retained its old state (Working or E_done), the forwarded
                // enterC signal would find no matching transition and throw.
                sfsm.receiveSignal('enterC');
                expect(sfsm.getCurrentStack()).toEqual(['A', 'B', 'C']);
                expect(sfsm.getHeadState()).toBe('Working');

                // Step 5: finishC — C exits again
                sfsm.receiveSignal('finishC');
                expect(sfsm.getCurrentStack()).toEqual(['A', 'B']);
                expect(sfsm.getHeadState()).toBe('Working');

                // Step 6: finishB — B exits, pops, A returns to I.
                // If B retained its old state (C or E_done), the next cycle's
                // forwarded enterB would find no matching transition and throw.
                sfsm.receiveSignal('finishB');
                expect(sfsm.getCurrentStack()).toEqual(['A']);
                expect(sfsm.getHeadState()).toBe('I');
            }

            // After 3 full cycles, the log should contain a deterministic,
            // repeating pattern of signals — proving each cycle is identical.
            // Each step generates 2 log entries (the transition + the forwarded
            // signal), so 6 steps × 2 = 12 entries per cycle, 36 total.
            const signals = sfsm.getLog().map(e => e.signal);
            expect(signals).toHaveLength(36);

            // The signal pattern per cycle (12 entries):
            //   enterB, enterB, enterC, enterC, finishC, finishC,
            //   enterC, enterC, finishC, finishC, finishB, finishB
            const oneCycle = [
                'enterB', 'enterB',
                'enterC', 'enterC',
                'finishC', 'finishC',
                'enterC', 'enterC',
                'finishC', 'finishC',
                'finishB', 'finishB'
            ];
            expect(signals).toEqual([...oneCycle, ...oneCycle, ...oneCycle]);
        });
    });
});
