import { FiniteStateMachine, ITransition } from "@vsirotin/ts-stop";
import { DefaultState } from "@vsirotin/ts-stop";
import { IStateWithAfterEntryAction } from "@vsirotin/ts-stop";
import { IStateWithOutputSignal } from "@vsirotin/ts-stop";

// Regular state without output signal
class RegularState {
    constructor(private name: string) {}

    toString(): string {
        return this.name;
    }
}

// State with output signal
class StateWithOutputSignal implements IStateWithOutputSignal<string> {
    public entryActionCalled = false;

    constructor(private name: string, private outputSignal: string) {}

    getOutputSignal(): string {
        return this.outputSignal;
    }

    toString(): string {
        return this.name;
    }
}

// State with output signal and entry action
class StateWithOutputSignalAndAction implements IStateWithOutputSignal<string>, IStateWithAfterEntryAction {
    public entryActionCalled = false;

    constructor(private name: string, private outputSignal: string) {}

    getOutputSignal(): string {
        return this.outputSignal;
    }

    afterEntryAction(): void {
        this.entryActionCalled = true;
    }

    toString(): string {
        return this.name;
    }
}

// State with dynamic output signal (changes based on internal state)
class DynamicOutputState implements IStateWithOutputSignal<string> {
    private counter = 0;
    public entryActionCalled = false;

    constructor(private name: string, private signals: string[]) {}

    getOutputSignal(): string {
        const signal = this.signals[this.counter % this.signals.length];
        this.counter++;
        return signal;
    }

    toString(): string {
        return this.name;
    }
}

// Default state with output signal
class DefaultStateWithOutput extends DefaultState implements IStateWithOutputSignal<string> {
    constructor(private name: string, private outputSignal: string) {
        super();
    }

    getOutputSignal(): string {
        return this.outputSignal;
    }

    toString(): string {
        return this.name;
    }
}

// Concrete test state machine implementation
class TestStateMachine extends FiniteStateMachine<
    RegularState | StateWithOutputSignal | StateWithOutputSignalAndAction | DynamicOutputState | DefaultStateWithOutput, 
    string
> {
    constructor(
        states: (RegularState | StateWithOutputSignal | StateWithOutputSignalAndAction | DynamicOutputState | DefaultStateWithOutput)[],
        signals: string[],
        transitions: ITransition<RegularState | StateWithOutputSignal | StateWithOutputSignalAndAction | DynamicOutputState | DefaultStateWithOutput, string>[],
        startState: RegularState | StateWithOutputSignal | StateWithOutputSignalAndAction | DynamicOutputState | DefaultStateWithOutput,
        skipValidation: boolean = false
    ) {
        super(states, signals, transitions, startState, skipValidation);
    }

    public testSendSignal(signal: string) {
        return this.sendSignal(signal);
    }
}

describe('StateWithOutputSignal Tests', () => {
    let regularState1: RegularState;
    let regularState2: RegularState;
    let outputState1: StateWithOutputSignal;
    let outputState2: StateWithOutputSignal;
    let outputStateWithAction: StateWithOutputSignalAndAction;
    let dynamicOutputState: DynamicOutputState;
    let defaultOutputState: DefaultStateWithOutput;

    beforeEach(() => {
        regularState1 = new RegularState('regular1');
        regularState2 = new RegularState('regular2');
        outputState1 = new StateWithOutputSignal('output1', 'auto1');
        outputState2 = new StateWithOutputSignal('output2', 'auto2');
        outputStateWithAction = new StateWithOutputSignalAndAction('outputWithAction', 'actionSignal');
        dynamicOutputState = new DynamicOutputState('dynamic', ['signal1', 'signal2']);
        defaultOutputState = new DefaultStateWithOutput('defaultOutput', 'defaultSignal');
    });

    describe('Single State with Output Signal', () => {
        test('should automatically process output signal when entering state with output signal', () => {
            const machine = new TestStateMachine(
                [regularState1, outputState1, regularState2],
                ['trigger', 'auto1'],
                [
                    { from: regularState1, signal: 'trigger', to: outputState1 },
                    { from: outputState1, signal: 'auto1', to: regularState2 }
                ],
                regularState1
            );

            // Initially at regular state
            expect(machine.getCurrentState()).toBe(regularState1);

            // Send trigger to move to output state - should automatically process output signal
            const result = machine.testSendSignal('trigger');
            
            // Should end up at regularState2 due to automatic output signal processing
            expect(result).toBe(regularState2);
            expect(machine.getCurrentState()).toBe(regularState2);
        });

        test('should handle state with output signal as start state', () => {
            const machine = new TestStateMachine(
                [outputState1, regularState1, regularState2],
                ['auto1', 'next'],
                [
                    { from: outputState1, signal: 'auto1', to: regularState1 },
                    { from: regularState1, signal: 'next', to: regularState2 }
                ],
                outputState1
            );

            // Should automatically process output signal and move to regularState1
            expect(machine.getCurrentState()).toBe(regularState1);
        });

        test('should execute entry actions before processing output signal', () => {
            const machine = new TestStateMachine(
                [regularState1, outputStateWithAction, regularState2],
                ['trigger', 'actionSignal'],
                [
                    { from: regularState1, signal: 'trigger', to: outputStateWithAction },
                    { from: outputStateWithAction, signal: 'actionSignal', to: regularState2 }
                ],
                regularState1
            );

            // Move to state with output signal and action
            machine.testSendSignal('trigger');

            // Entry action should have been called
            expect(outputStateWithAction.entryActionCalled).toBe(true);
            // Should end up at regularState2
            expect(machine.getCurrentState()).toBe(regularState2);
        });

        test('should throw when output signal state has no outgoing transition', () => {
            expect(() => {
                new TestStateMachine(
                    [regularState1, outputState1],
                    ['trigger', 'auto1', 'invalid'],
                    [
                        { from: regularState1, signal: 'trigger', to: outputState1 }
                        // No transition for 'auto1' from outputState1
                    ],
                    regularState1
                );
            }).toThrow(`Configuration error: State 'output1' implements IStateWithOutputSignal but has no outgoing transitions. States with output signals must have at least one outgoing transition.`);
        });

        test('should throw when output signal state has no outgoing transition even when default state present', () => {
            expect(() => {
                new TestStateMachine(
                    [regularState1, outputState1, defaultOutputState],
                    ['trigger', 'auto1'],
                    [
                        { from: regularState1, signal: 'trigger', to: outputState1 }
                        // No transition for 'auto1' from outputState1
                    ],
                    regularState1
                );
            }).toThrow(`Configuration error: State 'output1' implements IStateWithOutputSignal but has no outgoing transitions. States with output signals must have at least one outgoing transition.`);
        });
    });

    describe('Multiple States with Output Signals', () => {
        test('should handle chain of states with output signals', () => {
            const outputState3 = new StateWithOutputSignal('output3', 'auto3');
            
            const machine = new TestStateMachine(
                [regularState1, outputState1, outputState2, outputState3, regularState2],
                ['trigger', 'auto1', 'auto2', 'auto3'],
                [
                    { from: regularState1, signal: 'trigger', to: outputState1 },
                    { from: outputState1, signal: 'auto1', to: outputState2 },
                    { from: outputState2, signal: 'auto2', to: outputState3 },
                    { from: outputState3, signal: 'auto3', to: regularState2 }
                ],
                regularState1
            );

            // Send trigger should cascade through all output states
            const result = machine.testSendSignal('trigger');

            // Should end up at regularState2 after processing all output signals
            expect(result).toBe(regularState2);
            expect(machine.getCurrentState()).toBe(regularState2);
        });

        test('should handle parallel branches with output signals', () => {
            const outputStateA = new StateWithOutputSignal('outputA', 'signalA');
            const outputStateB = new StateWithOutputSignal('outputB', 'signalB');
            const finalStateA = new RegularState('finalA');
            const finalStateB = new RegularState('finalB');
            
            const machine = new TestStateMachine(
                [regularState1, outputStateA, outputStateB, finalStateA, finalStateB],
                ['branchA', 'branchB', 'signalA', 'signalB'],
                [
                    { from: regularState1, signal: 'branchA', to: outputStateA },
                    { from: regularState1, signal: 'branchB', to: outputStateB },
                    { from: outputStateA, signal: 'signalA', to: finalStateA },
                    { from: outputStateB, signal: 'signalB', to: finalStateB }
                ],
                regularState1
            );

            // Test branch A
            machine.testSendSignal('branchA');
            expect(machine.getCurrentState()).toBe(finalStateA);

            // Create new machine for branch B test since state machine can't go backwards
            const machine2 = new TestStateMachine(
                [regularState1, outputStateA, outputStateB, finalStateA, finalStateB],
                ['branchA', 'branchB', 'signalA', 'signalB'],
                [
                    { from: regularState1, signal: 'branchA', to: outputStateA },
                    { from: regularState1, signal: 'branchB', to: outputStateB },
                    { from: outputStateA, signal: 'signalA', to: finalStateA },
                    { from: outputStateB, signal: 'signalB', to: finalStateB }
                ],
                regularState1
            );

            // Test branch B
            machine2.testSendSignal('branchB');
            expect(machine2.getCurrentState()).toBe(finalStateB);
        });

        test('should handle dynamic output signals in sequential flow', () => {
            // Create a fresh dynamic state for this test to avoid counter interference
            const freshDynamicState = new DynamicOutputState('dynamic', ['signal1', 'signal2']);
            
            const machine = new TestStateMachine(
                [regularState1, freshDynamicState, regularState2],
                ['trigger', 'signal1', 'signal2'],
                [
                    { from: regularState1, signal: 'trigger', to: freshDynamicState },
                    { from: freshDynamicState, signal: 'signal1', to: regularState2 }
                    // Note: signal2 transition intentionally omitted to test first signal usage
                ],
                regularState1
            );

            // First trigger should use 'signal1' (first in the dynamic state's array)
            machine.testSendSignal('trigger');
            expect(machine.getCurrentState()).toBe(regularState2);
        });

        test('should handle multiple output states leading to same destination', () => {
            const outputStateX = new StateWithOutputSignal('outputX', 'converge');
            const outputStateY = new StateWithOutputSignal('outputY', 'converge');
            const convergenceState = new RegularState('convergence');
            
            const machine = new TestStateMachine(
                [regularState1, outputStateX, outputStateY, convergenceState],
                ['pathX', 'pathY', 'converge'],
                [
                    { from: regularState1, signal: 'pathX', to: outputStateX },
                    { from: regularState1, signal: 'pathY', to: outputStateY },
                    { from: outputStateX, signal: 'converge', to: convergenceState },
                    { from: outputStateY, signal: 'converge', to: convergenceState }
                ],
                regularState1
            );

            // Test path X
            machine.testSendSignal('pathX');
            expect(machine.getCurrentState()).toBe(convergenceState);

            // Create new machine for path Y test
            const machine2 = new TestStateMachine(
                [regularState1, outputStateX, outputStateY, convergenceState],
                ['pathX', 'pathY', 'converge'],
                [
                    { from: regularState1, signal: 'pathX', to: outputStateX },
                    { from: regularState1, signal: 'pathY', to: outputStateY },
                    { from: outputStateX, signal: 'converge', to: convergenceState },
                    { from: outputStateY, signal: 'converge', to: convergenceState }
                ],
                regularState1
            );

            // Test path Y
            machine2.testSendSignal('pathY');
            expect(machine2.getCurrentState()).toBe(convergenceState);
        });

        test('should handle mixed regular and output states in sequence', () => {
            const intermediateRegular = new RegularState('intermediate');
            
            const machine = new TestStateMachine(
                [regularState1, outputState1, intermediateRegular, outputState2, regularState2],
                ['start', 'auto1', 'continue', 'auto2'],
                [
                    { from: regularState1, signal: 'start', to: outputState1 },
                    { from: outputState1, signal: 'auto1', to: intermediateRegular },
                    { from: intermediateRegular, signal: 'continue', to: outputState2 },
                    { from: outputState2, signal: 'auto2', to: regularState2 }
                ],
                regularState1
            );

            // Start the sequence
            machine.testSendSignal('start');
            expect(machine.getCurrentState()).toBe(intermediateRegular);

            // Continue manually
            machine.testSendSignal('continue');
            expect(machine.getCurrentState()).toBe(regularState2);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should throw when isolated output state has no outgoing transition', () => {
            const isolatedOutputState = new StateWithOutputSignal('isolated', 'orphanSignal');

            expect(() => {
                new TestStateMachine(
                    [regularState1, isolatedOutputState],
                    ['trigger', 'orphanSignal'],
                    [
                        { from: regularState1, signal: 'trigger', to: isolatedOutputState }
                        // No transition for 'orphanSignal' from isolatedOutputState
                    ],
                    regularState1
                );
            }).toThrow(`Configuration error: State 'isolated' implements IStateWithOutputSignal but has no outgoing transitions. States with output signals must have at least one outgoing transition.`);
        });

        test('should handle empty output signal', () => {
            const emptyOutputState = new StateWithOutputSignal('empty', '');
            
            const machine = new TestStateMachine(
                [regularState1, emptyOutputState, regularState2],
                ['trigger', ''],
                [
                    { from: regularState1, signal: 'trigger', to: emptyOutputState },
                    { from: emptyOutputState, signal: '', to: regularState2 }
                ],
                regularState1
            );

            machine.testSendSignal('trigger');
            expect(machine.getCurrentState()).toBe(regularState2);
        });

        test('should handle null/undefined output signal gracefully', () => {
            class NullOutputState implements IStateWithOutputSignal<string> {
                constructor(private name: string) {}

                getOutputSignal(): string {
                    return null as any; // Intentionally return null
                }

                toString(): string {
                    return this.name;
                }
            }

            const nullOutputState = new NullOutputState('nullOutput');

            // nullOutputState implements IStateWithOutputSignal but returns null;
            // it must have an outgoing transition to pass construction validation.
            const machine = new TestStateMachine(
                [regularState1, nullOutputState as any, regularState2],
                ['trigger', 'next'],
                [
                    { from: regularState1, signal: 'trigger', to: nullOutputState as any },
                    { from: nullOutputState as any, signal: 'next', to: regularState2 }
                ],
                regularState1
            );

            // Should not throw when processing the null output signal at runtime
            expect(() => {
                machine.testSendSignal('trigger');
            }).not.toThrow();

            // Null output signal means no auto-transition fires; state stays at nullOutputState
            expect(machine.getCurrentState()).toBe(nullOutputState);
        });

        test('should throw when output signal state has no outgoing transition (signal not registered)', () => {
            const unmatchedOutputState = new StateWithOutputSignal('unmatched', 'nonExistentSignal');

            expect(() => {
                new TestStateMachine(
                    [regularState1, unmatchedOutputState],
                    ['trigger', 'differentSignal'], // Note: 'nonExistentSignal' not in signals array
                    [
                        { from: regularState1, signal: 'trigger', to: unmatchedOutputState }
                    ],
                    regularState1
                );
            }).toThrow(`Configuration error: State 'unmatched' implements IStateWithOutputSignal but has no outgoing transitions. States with output signals must have at least one outgoing transition.`);
        });

        test('should maintain state machine integrity with complex output signal scenarios', () => {
            const machine = new TestStateMachine(
                [regularState1, outputState1, outputStateWithAction, regularState2],
                ['trigger', 'auto1', 'actionSignal', 'manual'],
                [
                    { from: regularState1, signal: 'trigger', to: outputState1 },
                    { from: outputState1, signal: 'auto1', to: outputStateWithAction },
                    { from: outputStateWithAction, signal: 'actionSignal', to: regularState2 },
                    { from: regularState2, signal: 'manual', to: regularState1 }
                ],
                regularState1
            );

            // Test full cycle
            machine.testSendSignal('trigger');
            expect(machine.getCurrentState()).toBe(regularState2);
            expect(outputStateWithAction.entryActionCalled).toBe(true);

            // Test manual signal still works
            machine.testSendSignal('manual');
            expect(machine.getCurrentState()).toBe(regularState1);

            // Verify state machine methods still work correctly
            expect(machine.getAllStates()).toHaveLength(4);
            expect(machine.getAllSignals()).toHaveLength(4);
            expect(machine.getTransitions()).toHaveLength(4);
        });

        test('should throw when terminal output state has no outgoing transition', () => {
            const terminalOutputState = new StateWithOutputSignal('terminal', 'endSignal');

            expect(() => {
                new TestStateMachine(
                    [regularState1, terminalOutputState],
                    ['finish', 'endSignal'],
                    [
                        { from: regularState1, signal: 'finish', to: terminalOutputState }
                        // No transition from terminalOutputState - it's a terminal state
                    ],
                    regularState1
                );
            }).toThrow(`Configuration error: State 'terminal' implements IStateWithOutputSignal but has no outgoing transitions. States with output signals must have at least one outgoing transition.`);
        });

        test('should not throw when output signal state has at least one outgoing transition', () => {
            expect(() => {
                new TestStateMachine(
                    [regularState1, outputState1, regularState2],
                    ['trigger', 'auto1'],
                    [
                        { from: regularState1, signal: 'trigger', to: outputState1 },
                        { from: outputState1, signal: 'auto1', to: regularState2 }
                    ],
                    regularState1
                );
            }).not.toThrow();
        });

        test('should not throw when output state is start state with outgoing transition', () => {
            expect(() => {
                new TestStateMachine(
                    [outputState1, regularState1],
                    ['auto1'],
                    [
                        { from: outputState1, signal: 'auto1', to: regularState1 }
                    ],
                    outputState1
                );
            }).not.toThrow();
        });
    });

    describe('Integration with Default States', () => {
        test('should handle default state with output signal', () => {
            const machine = new TestStateMachine(
                [regularState1, regularState2, defaultOutputState],
                ['trigger', 'invalid', 'defaultSignal'],
                [
                    { from: regularState1, signal: 'trigger', to: regularState2 },
                    { from: defaultOutputState, signal: 'defaultSignal', to: regularState1 }
                ],
                regularState1
            );

            // Send invalid signal - should trigger default state
            machine.testSendSignal('invalid');
            
            // Should remain at regularState1 but default state should have processed
            expect(machine.getCurrentState()).toBe(regularState1);
            expect(machine.getDefaultState()).toBe(defaultOutputState);
        });

        test('should handle transition to default state with output signal', () => {
            const machine = new TestStateMachine(
                [regularState1, defaultOutputState, regularState2],
                ['toDefault', 'defaultSignal'],
                [
                    { from: regularState1, signal: 'toDefault', to: defaultOutputState },
                    { from: defaultOutputState, signal: 'defaultSignal', to: regularState2 }
                ],
                regularState1
            );

            // Move to default state - should automatically process output signal
            machine.testSendSignal('toDefault');
            expect(machine.getCurrentState()).toBe(regularState2);
        });
    });

    describe('Performance and State Consistency', () => {
        test('should maintain correct state after multiple output signal processings', () => {
            const machine = new TestStateMachine(
                [regularState1, outputState1, outputState2, regularState2],
                ['start', 'auto1', 'auto2', 'reset'],
                [
                    { from: regularState1, signal: 'start', to: outputState1 },
                    { from: outputState1, signal: 'auto1', to: outputState2 },
                    { from: outputState2, signal: 'auto2', to: regularState2 },
                    { from: regularState2, signal: 'reset', to: regularState1 }
                ],
                regularState1
            );

            // Run multiple cycles
            for (let i = 0; i < 3; i++) {
                machine.testSendSignal('start');
                expect(machine.getCurrentState()).toBe(regularState2);
                
                machine.testSendSignal('reset');
                expect(machine.getCurrentState()).toBe(regularState1);
            }
        });

        test('should correctly identify states with output signals', () => {
            // All output states must be reachable from regularState1
            const machine = new TestStateMachine(
                [regularState1, outputState1, outputStateWithAction],
                ['toOutput1', 'toOutputWithAction', 'auto1', 'actionSignal'],
                [
                    { from: regularState1, signal: 'toOutput1', to: outputState1 },
                    { from: regularState1, signal: 'toOutputWithAction', to: outputStateWithAction },
                    { from: outputState1, signal: 'auto1', to: regularState1 },
                    { from: outputStateWithAction, signal: 'actionSignal', to: regularState1 }
                ],
                regularState1
            );

            // Test the state identification logic
            expect(machine.hasState(outputState1)).toBe(true);
            expect(machine.hasState(outputStateWithAction)).toBe(true);
            expect(machine.hasState(regularState1)).toBe(true);
        });

        test('should handle state comparison correctly', () => {
            // outputState1 must have an outgoing transition to pass validation
            const machine = new TestStateMachine(
                [regularState1, outputState1],
                ['trigger', 'auto1'],
                [
                    { from: regularState1, signal: 'trigger', to: outputState1 },
                    { from: outputState1, signal: 'auto1', to: regularState1 }
                ],
                regularState1
            );

            expect(machine.getCurrentState()).toBe(regularState1);
            expect(machine.getCurrentState()).not.toBe(outputState1);
        });
    });

    describe('Output Signal Cycle Detection', () => {
        test('should throw ERROR-STOP-07 when two output states form a direct cycle', () => {
            const outputA = new StateWithOutputSignal('outputA', 'signalA');
            const outputB = new StateWithOutputSignal('outputB', 'signalB');

            expect(() => {
                new TestStateMachine(
                    [regularState1, outputA, outputB],
                    ['trigger', 'signalA', 'signalB'],
                    [
                        { from: regularState1, signal: 'trigger', to: outputA },
                        { from: outputA, signal: 'signalA', to: outputB },
                        { from: outputB, signal: 'signalB', to: outputA }
                    ],
                    regularState1
                );
            }).toThrow('ERROR-STOP-07');
        });

        test('should throw ERROR-STOP-07 when three output states form an indirect cycle', () => {
            const outputA = new StateWithOutputSignal('outputA', 'signalA');
            const outputB = new StateWithOutputSignal('outputB', 'signalB');
            const outputC = new StateWithOutputSignal('outputC', 'signalC');

            expect(() => {
                new TestStateMachine(
                    [regularState1, outputA, outputB, outputC],
                    ['trigger', 'signalA', 'signalB', 'signalC'],
                    [
                        { from: regularState1, signal: 'trigger', to: outputA },
                        { from: outputA, signal: 'signalA', to: outputB },
                        { from: outputB, signal: 'signalB', to: outputC },
                        { from: outputC, signal: 'signalC', to: outputA }
                    ],
                    regularState1
                );
            }).toThrow('ERROR-STOP-07');
        });

        test('should not throw for a chain of output states ending at a regular state', () => {
            const outputA = new StateWithOutputSignal('outputA', 'signalA');
            const outputB = new StateWithOutputSignal('outputB', 'signalB');

            expect(() => {
                new TestStateMachine(
                    [regularState1, outputA, outputB, regularState2],
                    ['trigger', 'signalA', 'signalB'],
                    [
                        { from: regularState1, signal: 'trigger', to: outputA },
                        { from: outputA, signal: 'signalA', to: outputB },
                        { from: outputB, signal: 'signalB', to: regularState2 }
                    ],
                    regularState1
                );
            }).not.toThrow();
        });

        test('should not throw when output states have no transitions to other output states', () => {
            const outputA = new StateWithOutputSignal('outputA', 'signalA');
            const outputB = new StateWithOutputSignal('outputB', 'signalB');

            expect(() => {
                new TestStateMachine(
                    [regularState1, outputA, outputB, regularState2],
                    ['toA', 'toB', 'signalA', 'signalB'],
                    [
                        { from: regularState1, signal: 'toA', to: outputA },
                        { from: regularState1, signal: 'toB', to: outputB },
                        { from: outputA, signal: 'signalA', to: regularState2 },
                        { from: outputB, signal: 'signalB', to: regularState2 }
                    ],
                    regularState1
                );
            }).not.toThrow();
        });
    });
});
