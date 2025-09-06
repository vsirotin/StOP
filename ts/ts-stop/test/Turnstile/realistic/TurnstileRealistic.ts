import { IStateWithActions } from "../../../src/IStateWithActions";
import { NonEmpty, transitionMatrix, TransitionMatrix } from "../../../src/TransitionMatrix";
import { TurnstileAbstract } from "../objects/TurnstileAbstract";
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
const l = new LockedStateRealistic(coinAcceptor, barrierArms, statusIndicator);
const u = new UnlockedStateRealistic(coinAcceptor, barrierArms, statusIndicator);

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

export class TurnstileRealistic extends TurnstileAbstract {
    constructor() {
        super(turnstileMatrix);
    }
}