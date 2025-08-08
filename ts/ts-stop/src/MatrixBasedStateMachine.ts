import { FiniteStateMachine, IFiniteStateMachine } from './FiniteStateMachine';
import { TransitionMatrix } from './TransitionMatrix';

/**
 * Abstract base class for finite state machines that use transition matrices.
 * 
 * This class extends FiniteStateMachine to provide a more intuitive way to define
 * state transitions using a 2D matrix representation instead of explicit transition arrays.
 * 
 * The matrix format allows for visual representation of state transitions:
 * - Columns represent states
 * - Rows represent signals
 * - Cell values represent target states
 * - Empty cells represent invalid/ignored transitions
 * 
 * @template STATE - The type representing possible states
 * @template SIGNAL - The type representing signals/events
 * 
 * @example
 * ```typescript
 * class MyStateMachine extends MatrixBasedStateMachine<string, string> {
 *     constructor() {
 *         const matrix = transitionMatrix([
 *             [           , "locked"    , "unlocked" ],
 *             [ "coin"    , "unlocked" ,             ],
 *             [ "push"    ,            , "locked"   ]
 *         ]);
 *         super(matrix, "locked");
 *     }
 * }
 * ```
 */
abstract class MatrixBasedStateMachine<STATE, SIGNAL> extends FiniteStateMachine<STATE, SIGNAL> {
    /**
     * The transition matrix used to define state transitions.
     * Stored for potential debugging or inspection purposes.
     */
    protected readonly matrix: TransitionMatrix<STATE, SIGNAL>;

    /**
     * Creates a new matrix-based finite state machine.
     * 
     * @param matrix - The transition matrix defining all states, signals, and transitions
     * @param startState - The initial state of the machine (must be one of the states in the matrix)
     * 
     * @throws {Error} If startState is not found in the matrix states
     * 
     * @example
     * ```typescript
     * const matrix = transitionMatrix([
     *     [           , "idle"     , "running"  , "error"   ],
     *     [ "start"   , "running" ,            ,           ],
     *     [ "stop"    ,           , "idle"     ,           ],
     *     [ "error"   , "error"   , "error"    , "error"   ],
     *     [ "reset"   , "idle"    , "idle"     , "idle"    ]
     * ]);
     * 
     * class ProcessStateMachine extends MatrixBasedStateMachine<string, string> {
     *     constructor() {
     *         super(matrix, "idle");
     *     }
     * }
     * ```
     */
    constructor(matrix: TransitionMatrix<STATE, SIGNAL>, startState: STATE) {
        // Validate that startState exists in the matrix
        const states = matrix.getStates();
        if (!states.includes(startState)) {
            throw new Error(
                `Start state '${String(startState)}' not found in matrix states: [${states.map(s => String(s)).join(', ')}]`
            );
        }

        // Call parent constructor with matrix-derived data
        super(
            matrix.getStates(),
            matrix.getSignals(),
            matrix.getTransitions(),
            startState
        );

        // Store the matrix for potential future use
        this.matrix = matrix;
    }

    /**
     * Gets the transition matrix used by this state machine.
     * 
     * @returns The transition matrix
     */
    getMatrix(): TransitionMatrix<STATE, SIGNAL> {
        return this.matrix;
    }

    /**
     * Prints the transition matrix for debugging purposes.
     * 
     * This method provides a visual representation of the state machine's
     * transition table, making it easier to understand and debug the logic.
     */
    printTransitionMatrix(): void {
        console.log(`\n${this.constructor.name} Transition Matrix:`);
        this.matrix.printMatrix();
    }

    /**
     * Gets all possible states from the matrix.
     * 
     * @returns Array of all states in the state machine
     */
    getAllStates(): STATE[] {
        return this.matrix.getStates();
    }

    /**
     * Gets all possible signals from the matrix.
     * 
     * @returns Array of all signals in the state machine
     */
    getAllSignals(): SIGNAL[] {
        return this.matrix.getSignals();
    }

    /**
     * Checks if a given state exists in the state machine.
     * 
     * @param state - The state to check
     * @returns true if the state exists, false otherwise
     */
    hasState(state: STATE): boolean {
        return this.matrix.getStates().includes(state);
    }

    /**
     * Checks if a given signal exists in the state machine.
     * 
     * @param signal - The signal to check  
     * @returns true if the signal exists, false otherwise
     */
    hasSignal(signal: SIGNAL): boolean {
        return this.matrix.getSignals().includes(signal);
    }

    /**
     * Gets all valid transitions from the current state.
     * 
     * @returns Array of signals that can trigger transitions from the current state
     */
    getValidSignalsFromCurrentState(): SIGNAL[] {
        const currentState = this.getCurrentState();
        return this.matrix.getTransitions()
            .filter(t => t.from === currentState)
            .map(t => t.signal);
    }

    /**
     * Checks if a signal is valid from the current state.
     * 
     * @param signal - The signal to check
     * @returns true if the signal can cause a transition from the current state
     */
    isValidSignalFromCurrentState(signal: SIGNAL): boolean {
        return this.getValidSignalsFromCurrentState().includes(signal);
    }
}

// Export the class
export { MatrixBasedStateMachine };