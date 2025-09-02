import { IStateWithActions } from "../../../src/IStateWithActions";
import { MatrixBasedStateMachine } from "../../../src/MatrixBasedStateMachine";
import { NonEmpty, TransitionMatrix } from "../../../src/TransitionMatrix";
import { TurnstileSignal } from './TurnstileSignal';

/**
 * Turnstile implementation using state objects with actions.
 * 
 * This class extends the matrix-based state machine to use actual state objects
 * that can perform actions when entering or exiting states, providing a more
 * object-oriented approach to state management.
 */
export abstract class TurnstileAbstract extends MatrixBasedStateMachine<IStateWithActions, TurnstileSignal> {
    // Reference to the state objects

    constructor(matrix : TransitionMatrix<NonEmpty<IStateWithActions>, NonEmpty<TurnstileSignal>> ,
         private lockedState : IStateWithActions = matrix.getStates()[0],
         private unlockedState : IStateWithActions = matrix.getStates()[1]) 
    {
        super(matrix);
        
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

}