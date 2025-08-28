import { MatrixBasedStateMachine } from '../../../src/MatrixBasedStateMachine';
import { NonEmpty, TransitionMatrix, transitionMatrix } from '../../../src/TransitionMatrix';
import { IStateWithActions } from '../../../src/IStateWithActions';
import { TurnstileAbstract } from './TurnstileAbstract';

/**
 * Enum representing signals for turnstile operations.
 */
export enum TurnstileSignal {
    COIN = "coin",
    PUSH = "push"
}

/**
 * Locked state object with entry and exit actions.
 */
export class LockedState implements IStateWithActions {
    /**
     * Action executed after entering the locked state.
     */
    afterEntryAction(): void {
        console.log("Turnstile is now LOCKED - passage blocked");
    }

    /**
     * Action executed before exiting the locked state.
     */
    beforeExitAction(): void {
        console.log("Processing payment - preparing to unlock...");
    }

    /**
     * String representation of the state.
     */
    toString(): string {
        return "locked";
    }
}

/**
 * Unlocked state object with entry and exit actions.
 */
export class UnlockedState implements IStateWithActions {
    /**
     * Action executed after entering the unlocked state.
     */
    afterEntryAction(): void {
        console.log("Turnstile is now UNLOCKED - passage allowed");
    }

    /**
     * Action executed before exiting the unlocked state.
     */
    beforeExitAction(): void {
        console.log("Person passing through - preparing to lock...");
    }

    /**
     * String representation of the state.
     */
    toString(): string {
        return "unlocked";
    }
}

// Create state instances outside the class
const l = new LockedState();
const u = new UnlockedState();

const coin = TurnstileSignal.COIN;
const push = TurnstileSignal.PUSH;

// Define the transition matrix using the state objects
const turnstileMatrix : TransitionMatrix<NonEmpty<IStateWithActions>, NonEmpty<TurnstileSignal>>  
        = transitionMatrix<IStateWithActions, TurnstileSignal>([
    [      , l , u ],
    [ coin , u ,   ],
    [ push ,   , l ]
]);

/**
 * TurnstileObject - State-oriented implementation of a subway/metro turnstile
 * 
 * This class demonstrates the StOP (State-oriented Programming) paradigm by implementing
 * a turnstile as a finite state machine with action-enabled states. The turnstile operates
 * with two primary states (locked/unlocked) and responds to two signals (coin/push).
 * 
 * ## Key Features:
 * - **Matrix-based state machine**: Uses a transition matrix for clear state definition
 * - **Action-enabled states**: Each state executes specific actions on entry/exit
 * - **Type-safe signals**: Uses enum for signal definitions
 * - **Inheritance-based**: Extends TurnstileAbstract for shared functionality
 * 
 * ## State Machine Behavior:
 * ```
 * [LOCKED] --coin--> [UNLOCKED] --push--> [LOCKED]
 * ```
 * 
 * ## States:
 * - **LockedState**: Blocks passage, awaits payment
 *   - Entry: Logs "Turnstile is now LOCKED - passage blocked"
 *   - Exit: Logs "Processing payment - preparing to unlock..."
 * 
 * - **UnlockedState**: Allows passage after payment
 *   - Entry: Logs "Turnstile is now UNLOCKED - passage allowed"
 *   - Exit: Logs "Person passing through - preparing to lock..."
 * 
 * ## Signals:
 * - **COIN**: Payment received, triggers unlock (if locked)
 * - **PUSH**: Person attempts passage, triggers lock (if unlocked)
 * 
 * ## Usage Pattern:
 * 1. Initialize turnstile (starts in LOCKED state)
 * 2. Insert coin → transitions to UNLOCKED
 * 3. Push through → transitions back to LOCKED
 * 4. Repeat cycle
 * 
 * @extends TurnstileAbstract
 * @implements Matrix-based state machine pattern
 * @example
 * ```typescript
 * const turnstile = new TurnstileObject();
 * console.log(turnstile.isLocked()); // true
 * 
 * turnstile.insertCoin();
 * console.log(turnstile.isUnlocked()); // true
 * 
 * turnstile.pushThrough();
 * console.log(turnstile.isLocked()); // true
 * ```
 */

export class TurnstileObject extends TurnstileAbstract {
    constructor() {
        super(turnstileMatrix);
    }
}


