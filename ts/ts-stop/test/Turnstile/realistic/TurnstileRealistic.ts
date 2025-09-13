import { IStateWithActions } from "../../../src/IStateWithActions";
import { MatrixBasedStateMachine } from "../../../src/MatrixBasedStateMachine";
import { NonEmpty, transitionMatrix, TransitionMatrix } from "../../../src/TransitionMatrix";
import { TurnstileSignal } from '../objects/TurnstileSignal';
import { BarrierArms } from "./devices/BarrierArms";
import { CoinAcceptor } from "./devices/CoinAcceptor";
import { StatusIndicator } from "./devices/StatusIndicator";
import { LockedStateRealistic } from "./states/LockedStateRealistic";
import { UnlockedStateRealistic } from "./states/UnlockedStateRealistic";

// Device simulators

const coinAcceptor = new CoinAcceptor();
const barrierArms = new BarrierArms();
const statusIndicator = new StatusIndicator();

// Create state instances 
const l = new LockedStateRealistic(coinAcceptor, statusIndicator);
const u = new UnlockedStateRealistic(barrierArms);

// Create short aliases for signals
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
 * @implements Matrix-based state machine pattern
 */

export class TurnstileRealistic extends MatrixBasedStateMachine<IStateWithActions, TurnstileSignal> {
    constructor( )
    {
        super(turnstileMatrix);
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
}
