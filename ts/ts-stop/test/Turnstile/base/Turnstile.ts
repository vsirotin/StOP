import { MatrixBasedStateMachine } from '../../../src/MatrixBasedStateMachine';
import { transitionMatrix } from '../../../src/TransitionMatrix';

/**
 * Turnstile implementation using matrix-based state machine.
 */
export class Turnstile extends MatrixBasedStateMachine<string, string> {
    constructor() {
        const matrix = transitionMatrix([
            [           , "locked"    , "unlocked" ],
            [ "coin"    , "unlocked" ,             ],
            [ "push"    ,            , "locked"   ]
        ]);
        
        super(matrix, "locked");
    }

        /**
     * 
     * Simulate inserting a coin into the turnstile.
     * 
     * @remarks
     * This is a convenience method that sends the "coin" signal to the state machine,
     * triggering a state transition if valid (from "locked" to "unlocked").
     * 
     * If the turnstile is already "unlocked", sending this signal has no effect.
     * @returns The resulting state after inserting coin
     */
    insertCoin(): string { 
        return this.sendSignal('coin'); 
    }

    /*
     * Simulate pushing through the turnstile.
     * 
     * @remarks
     * This is a convenience method that sends the "push" signal to the state machine,
     * triggering a state transition if valid (from "unlocked" to "locked").
     * 
     * If the turnstile is already "locked", sending this signal has no effect.
     * @returns The resulting state after pushing through
     */
    pushThrough(): string { 
        return this.sendSignal('push'); 
    }

}
