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
 * // Example 1: Using explicit start state
 * class TurnstileMatrix extends MatrixBasedStateMachine<string, string> {
 *     constructor() {
 *         const matrix = transitionMatrix([
 *             [           , "locked"    , "unlocked" ],
 *             [ "coin"    , "unlocked" ,             ],
 *             [ "push"    ,            , "locked"   ]
 *         ]);
 *         super(matrix, "locked"); // Explicit start state
 *     }
 * }
 * 
 * // Example 2: Using first state as start state (auto)
 * class TurnstileMatrixAuto extends MatrixBasedStateMachine<string, string> {
 *     constructor() {
 *         const matrix = transitionMatrix([
 *             [           , "locked"    , "unlocked" ],  // "locked" becomes start state
 *             [ "coin"    , "unlocked" ,             ],
 *             [ "push"    ,            , "locked"   ]
 *         ]);
 *         super(matrix); // Uses first state ("locked") as start state
 *     }
 * }
 * ```
 */
export abstract class MatrixBasedStateMachine<STATE, SIGNAL> extends FiniteStateMachine<STATE, SIGNAL> {
    /**
     * The transition matrix used to define state transitions.
     * Stored for potential debugging or inspection purposes.
     */
    protected readonly matrix: TransitionMatrix<STATE, SIGNAL>;

    /**
     * Creates a new matrix-based finite state machine.
     * 
     * @param matrix - The transition matrix defining all states, signals, and transitions
     * @param startState - Optional. The initial state of the machine. If not provided, 
     *                     the first state from the matrix (first column in header row) will be used.
     *                     If provided, must be one of the states in the matrix.
     * 
     * @throws {Error} If matrix has no states
     * @throws {Error} If startState is provided but not found in the matrix states
     * 
     * @example
     * ```typescript
     * // Constructor with explicit start state
     * const matrix = transitionMatrix([
     *     [           , "locked"    , "unlocked" ],
     *     [ "coin"    , "unlocked" ,             ],
     *     [ "push"    ,            , "locked"   ]
     * ]);
     * super(matrix, "unlocked"); // Start in unlocked state
     * 
     * // Constructor with auto start state (uses first state)
     * super(matrix); // Automatically starts in "locked" state
     * ```
     * 
     * @example
     * ```typescript
     * // TurnstileMatrix implementation from test/Turnstile/TurnstileMatrix.ts
     * class TurnstileMatrix extends MatrixBasedStateMachine<string, string> {
     *     constructor() {
     *         const matrix = transitionMatrix([
     *             [           , "locked"    , "unlocked" ],
     *             [ "coin"    , "unlocked" ,             ],
     *             [ "push"    ,            , "locked"   ]
     *         ]);
     *         
     *         // Two ways to call the constructor:
     *         super(matrix, "locked");  // Option 1: Explicit start state
     *         // OR
     *         super(matrix);            // Option 2: Auto start state (uses "locked")
     *     }
     *     
     *     insertCoin(): string { return this.sendSignal('coin'); }
     *     pushThrough(): string { return this.sendSignal('push'); }
     *     isLocked(): boolean { return this.getCurrentState() === 'locked'; }
     *     isUnlocked(): boolean { return this.getCurrentState() === 'unlocked'; }
     * }
     * ```
     */
    constructor(matrix: TransitionMatrix<STATE, SIGNAL>, startState?: STATE) {
        // Get states from matrix
        const states = matrix.getStates();
        
        // Validate matrix has states
        if (states.length === 0) {
            throw new Error('Matrix must contain at least one state');
        }
        
        // Determine the actual start state
        let actualStartState: STATE;
        
        if (startState !== undefined) {
            // Explicit start state provided - validate it exists
            if (!states.includes(startState)) {
                throw new Error(
                    `Start state '${String(startState)}' not found in matrix states: [${states.map(s => String(s)).join(', ')}]`
                );
            }
            actualStartState = startState;
        } else {
            // No start state provided - use first state from matrix
            actualStartState = states[0];
        }

        // Call parent constructor with matrix-derived data
        super(
            matrix.getStates(),
            matrix.getSignals(),
            matrix.getTransitions(),
            actualStartState
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
}