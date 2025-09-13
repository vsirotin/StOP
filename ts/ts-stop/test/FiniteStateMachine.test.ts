import { FiniteStateMachine, ITransition } from "../src/FiniteStateMachine";
import { DefaultState } from "../src/DefaultState";
import { IStateWithAfterEntryAction } from "../src/IStateWithActions";


// Test implementation extending DefaultState
class TestDefaultState extends DefaultState {
    constructor(private name: string) {
        super();
    }

    toString(): string {
        return this.name;
    }
}

// Another test implementation extending DefaultState
class AnotherDefaultState extends DefaultState {
    constructor(private name: string) {
        super();
    }

    toString(): string {
        return this.name;
    }
}

// Regular state without IDefaultState
class RegularState {
    constructor(private name: string) {}

    toString(): string {
        return this.name;
    }
}

// State with entry action
class StateWithAction implements IStateWithAfterEntryAction {
    public entryActionCalled = false;

    constructor(private name: string) {}

    afterEntryAction(): void {
        this.entryActionCalled = true;
    }

    toString(): string {
        return this.name;
    }
}

// Concrete test state machine implementation
class TestStateMachine extends FiniteStateMachine<TestDefaultState | AnotherDefaultState | RegularState | StateWithAction, string> {
    constructor(
        states: (TestDefaultState | AnotherDefaultState | RegularState | StateWithAction)[],
        signals: string[],
        transitions: ITransition<TestDefaultState | AnotherDefaultState | RegularState | StateWithAction, string>[],
        startState: TestDefaultState | AnotherDefaultState | RegularState | StateWithAction
    ) {
        super(states, signals, transitions, startState);
    }

    public testSendSignal(signal: string) {
        return this.sendSignal(signal);
    }
}

describe('FiniteStateMachine Constructor Tests', () => {
    let regularState1: RegularState;
    let regularState2: RegularState;
    let defaultState1: TestDefaultState;
    let defaultState2: AnotherDefaultState;
    let stateWithAction: StateWithAction;

    beforeEach(() => {
        regularState1 = new RegularState('regular1');
        regularState2 = new RegularState('regular2');
        defaultState1 = new TestDefaultState('default1');
        defaultState2 = new AnotherDefaultState('default2');
        stateWithAction = new StateWithAction('withAction');
    });

    describe('Default State Validation ', () => {
        test('should throw error when multiple states implement IDefaultState', () => {
            expect(() => {
                new TestStateMachine(
                    [regularState1, defaultState1, defaultState2], // Two default states
                    ['signal1'],
                    [{ from: regularState1, signal: 'signal1', to: defaultState1 }],
                    regularState1
                );
            }).toThrow('Multiple states implement IDefaultState interface. Only one state can handle invalid signals. Found 2 states with IDefaultState.');
        });

        test('should throw error with correct count when three default states are provided', () => {
            const defaultState3 = new TestDefaultState('default3');
            
            expect(() => {
                new TestStateMachine(
                    [regularState1, defaultState1, defaultState2, defaultState3], // Three default states
                    ['signal1'],
                    [{ from: regularState1, signal: 'signal1', to: defaultState1 }],
                    regularState1
                );
            }).toThrow('Multiple states implement IDefaultState interface. Only one state can handle invalid signals. Found 3 states with IDefaultState.');
        });

        test('should succeed when exactly one state implements IDefaultState', () => {
            expect(() => {
                new TestStateMachine(
                    [regularState1, regularState2, defaultState1], // One default state
                    ['signal1'],
                    [{ from: regularState1, signal: 'signal1', to: regularState2 }],
                    regularState1
                );
            }).not.toThrow();
        });

        test('should succeed when no states implement IDefaultState', () => {
            expect(() => {
                new TestStateMachine(
                    [regularState1, regularState2], // No default states
                    ['signal1'],
                    [{ from: regularState1, signal: 'signal1', to: regularState2 }],
                    regularState1
                );
            }).not.toThrow();
        });

        test('should correctly identify and set single default state', () => {
            const machine = new TestStateMachine(
                [regularState1, regularState2, defaultState1],
                ['signal1'],
                [{ from: regularState1, signal: 'signal1', to: regularState2 }],
                regularState1
            );

            expect(machine.getDefaultState()).toBe(defaultState1);
            expect(machine.hasDefaultState()).toBe(true);
        });

        test('should set default state to null when no default states exist', () => {
            const machine = new TestStateMachine(
                [regularState1, regularState2],
                ['signal1'],
                [{ from: regularState1, signal: 'signal1', to: regularState2 }],
                regularState1
            );

            expect(machine.getDefaultState()).toBeNull();
            expect(machine.hasDefaultState()).toBe(false);
        });
    });

    describe('Constructor Initialization', () => {
        test('should initialize current state to start state', () => {
            const machine = new TestStateMachine(
                [regularState1, regularState2],
                ['signal1'],
                [{ from: regularState1, signal: 'signal1', to: regularState2 }],
                regularState1
            );

            expect(machine.getCurrentState()).toBe(regularState1);
        });

        test('should execute entry action on start state during initialization', () => {
            const machine = new TestStateMachine(
                [stateWithAction, regularState1],
                ['signal1'],
                [{ from: stateWithAction, signal: 'signal1', to: regularState1 }],
                stateWithAction
            );

            expect(stateWithAction.entryActionCalled).toBe(true);
        });

        test('should not execute entry action on states without entry action interface', () => {
            const machine = new TestStateMachine(
                [regularState1, regularState2],
                ['signal1'],
                [{ from: regularState1, signal: 'signal1', to: regularState2 }],
                regularState1
            );

            // Should not throw any errors and initialize successfully
            expect(machine.getCurrentState()).toBe(regularState1);
        });

        test('should correctly store all provided states', () => {
            const states = [regularState1, regularState2, defaultState1];
            const machine = new TestStateMachine(
                states,
                ['signal1'],
                [{ from: regularState1, signal: 'signal1', to: regularState2 }],
                regularState1
            );

            const allStates = machine.getAllStates();
            expect(allStates).toHaveLength(3);
            expect(allStates).toContain(regularState1);
            expect(allStates).toContain(regularState2);
            expect(allStates).toContain(defaultState1);
        });

        test('should correctly store all provided signals', () => {
            const signals = ['signal1', 'signal2', 'signal3'];
            const machine = new TestStateMachine(
                [regularState1, regularState2],
                signals,
                [{ from: regularState1, signal: 'signal1', to: regularState2 }],
                regularState1
            );

            const allSignals = machine.getAllSignals();
            expect(allSignals).toHaveLength(3);
            expect(allSignals).toContain('signal1');
            expect(allSignals).toContain('signal2');
            expect(allSignals).toContain('signal3');
        });

        test('should correctly store all provided transitions', () => {
            const transitions: ITransition<RegularState, string>[] = [
                { from: regularState1, signal: 'signal1', to: regularState2 },
                { from: regularState2, signal: 'signal2', to: regularState1 }
            ];

            const machine = new TestStateMachine(
                [regularState1, regularState2],
                ['signal1', 'signal2'],
                transitions,
                regularState1
            );

            const allTransitions = machine.getTransitions();
            expect(allTransitions).toHaveLength(2);
            expect(allTransitions).toEqual(expect.arrayContaining(transitions));
        });
    });

    describe('Constructor Edge Cases', () => {
        test('should handle empty states array', () => {
            expect(() => {
                new TestStateMachine(
                    [],
                    ['signal1'],
                    [],
                    regularState1 // This would be invalid but testing constructor behavior
                );
            }).not.toThrow();
        });

        test('should handle empty signals array', () => {
            expect(() => {
                new TestStateMachine(
                    [regularState1, regularState2],
                    [],
                    [],
                    regularState1
                );
            }).not.toThrow();
        });

        test('should handle empty transitions array', () => {
            const machine = new TestStateMachine(
                [regularState1, regularState2],
                ['signal1'],
                [],
                regularState1
            );

            expect(machine.getTransitions()).toHaveLength(0);
            expect(machine.getCurrentState()).toBe(regularState1);
        });

        test('should handle single state machine', () => {
            const machine = new TestStateMachine(
                [regularState1],
                ['signal1'],
                [],
                regularState1
            );

            expect(machine.getAllStates()).toHaveLength(1);
            expect(machine.getCurrentState()).toBe(regularState1);
        });

        test('should work with default state as start state', () => {
            const machine = new TestStateMachine(
                [regularState1, defaultState1],
                ['signal1'],
                [{ from: defaultState1, signal: 'signal1', to: regularState1 }],
                defaultState1
            );

            expect(machine.getCurrentState()).toBe(defaultState1);
            expect(machine.getDefaultState()).toBe(defaultState1);
        });
    });

    describe('Mixed State Types in Constructor', () => {
        test('should handle mix of regular states, default states, and action states', () => {
            const machine = new TestStateMachine(
                [regularState1, defaultState1, stateWithAction],
                ['signal1', 'signal2'],
                [
                    { from: regularState1, signal: 'signal1', to: stateWithAction },
                    { from: stateWithAction, signal: 'signal2', to: regularState1 }
                ],
                regularState1
            );

            expect(machine.getAllStates()).toHaveLength(3);
            expect(machine.getDefaultState()).toBe(defaultState1);
            expect(machine.getCurrentState()).toBe(regularState1);
        });

        test('should validate default state interface correctly with mixed state types', () => {
            // This should work - one default state among other types
            expect(() => {
                new TestStateMachine(
                    [regularState1, stateWithAction, defaultState1, regularState2],
                    ['signal1'],
                    [{ from: regularState1, signal: 'signal1', to: stateWithAction }],
                    regularState1
                );
            }).not.toThrow();

            // This should fail - two default states among other types
            expect(() => {
                new TestStateMachine(
                    [regularState1, stateWithAction, defaultState1, defaultState2],
                    ['signal1'],
                    [{ from: regularState1, signal: 'signal1', to: stateWithAction }],
                    regularState1
                );
            }).toThrow('Multiple states implement IDefaultState interface. Only one state can handle invalid signals. Found 2 states with IDefaultState.');
        });
    });

    describe('Error Message Accuracy', () => {
        test('should include exact count in error message for different numbers of default states', () => {
            // Test with 2 default states
            expect(() => {
                new TestStateMachine(
                    [defaultState1, defaultState2],
                    ['signal1'],
                    [],
                    defaultState1
                );
            }).toThrow('Found 2 states with IDefaultState');

            // Test with 4 default states
            const defaultState3 = new TestDefaultState('default3');
            const defaultState4 = new AnotherDefaultState('default4');
            
            expect(() => {
                new TestStateMachine(
                    [defaultState1, defaultState2, defaultState3, defaultState4],
                    ['signal1'],
                    [],
                    defaultState1
                );
            }).toThrow('Found 4 states with IDefaultState');
        });

        test('should provide complete error message', () => {
            expect(() => {
                new TestStateMachine(
                    [defaultState1, defaultState2],
                    ['signal1'],
                    [],
                    defaultState1
                );
            }).toThrow(
                'Multiple states implement IDefaultState interface. ' +
                'Only one state can handle invalid signals. ' +
                'Found 2 states with IDefaultState.'
            );
        });
    });
});