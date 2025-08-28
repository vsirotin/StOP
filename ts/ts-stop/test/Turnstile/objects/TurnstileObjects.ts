import { MatrixBasedStateMachine } from '../../../src/MatrixBasedStateMachine';
import { transitionMatrix } from '../../../src/TransitionMatrix';
import { IStateWithActions } from '../../../src/IStateWithActions';

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
const turnstileMatrix = transitionMatrix<IStateWithActions, TurnstileSignal>([
    [      , l , u ],
    [ coin , u ,   ],
    [ push ,   , l ]
]);

/**
 * Turnstile implementation using state objects with actions.
 * 
 * This class extends the matrix-based state machine to use actual state objects
 * that can perform actions when entering or exiting states, providing a more
 * object-oriented approach to state management.
 */
export class TurnstileObject extends MatrixBasedStateMachine<IStateWithActions, TurnstileSignal> {
    // Reference to the state objects
    private readonly lockedState = l;
    private readonly unlockedState = u;

    constructor() {
        super(turnstileMatrix);
        
        // Execute initial state entry action
        this.getCurrentState().afterEntryAction();
    }


    /**
     * Convenience method to insert a coin.
     * 
     * @returns The resulting state after inserting coin
     */
    insertCoin(): IStateWithActions {
        return this.sendSignal(TurnstileSignal.COIN);
    }

    /**
     * Convenience method to push through the turnstile.
     * 
     * @returns The resulting state after pushing through
     */
    pushThrough(): IStateWithActions {
        return this.sendSignal(TurnstileSignal.PUSH);
    }

    /**
     * Check if the turnstile is currently locked.
     * 
     * @returns true if in locked state, false otherwise
     */
    isLocked(): boolean {
        return this.getCurrentState() === this.lockedState;
    }

    /**
     * Check if the turnstile is currently unlocked.
     * 
     * @returns true if in unlocked state, false otherwise
     */
    isUnlocked(): boolean {
        return this.getCurrentState() === this.unlockedState;
    }

    /**
     * Get the string representation of the current state.
     * 
     * @returns String representation of current state
     */
    getCurrentStateString(): string {
        return this.getCurrentState().toString();
    }

    /**
     * Get the locked state object.
     * 
     * @returns The locked state object
     */
    getLockedState(): IStateWithActions {
        return this.lockedState;
    }

    /**
     * Get the unlocked state object.
     * 
     * @returns The unlocked state object
     */
    getUnlockedState(): IStateWithActions {
        return this.unlockedState;
    }
}


/**
 * Usage example:
 * 
 * ```typescript
 * const turnstile = new TurnstileObject();
 * // Output: 🔒 Turnstile is now LOCKED - passage blocked
 * 
 * console.log(turnstile.getCurrentStateString()); // "locked"
 * 
 * turnstile.insertCoin();
 * // Output: 🪙 Processing payment - preparing to unlock...
 * // Output: 🔓 Turnstile is now UNLOCKED - passage allowed
 * 
 * console.log(turnstile.getCurrentStateString()); // "unlocked"
 * 
 * turnstile.pushThrough();
 * // Output: 🚶 Person passing through - preparing to lock...
 * // Output: 🔒 Turnstile is now LOCKED - passage blocked
 * 
 * console.log(turnstile.getCurrentStateString()); // "locked"
 * ```
 */