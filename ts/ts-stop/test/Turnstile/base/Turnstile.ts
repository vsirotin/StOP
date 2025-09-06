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

    // Convenience methods
    insertCoin(): string { return this.sendSignal('coin'); }
    pushThrough(): string { return this.sendSignal('push'); }
    isLocked(): boolean { return this.getCurrentState() === 'locked'; }
    isUnlocked(): boolean { return this.getCurrentState() === 'unlocked'; }
}
