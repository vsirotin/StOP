// Add these imports to existing TurnstileRealistic.ts
import { IStateWithActions } from "../../../../src/IStateWithActions";
import { NonEmpty, transitionMatrix, TransitionMatrix } from "../../../../src/TransitionMatrix";
import { TurnstileSignal } from "../../objects/TurnstileSignal";
import { BarrierArms } from "../devices/BarrierArms";
import { CoinAcceptor } from "../devices/CoinAcceptor";
import { StatusIndicator } from "../devices/StatusIndicator";
import { LockedStateRealistic } from "../states/LockedStateRealistic";
import { UnlockedStateRealistic } from "../states/UnlockedStateRealistic";
import { Buzzer } from "../devices/Buzzer";
import { ErrorAttemptState } from "../states/ErrorAttemptState";
import { MatrixBasedStateMachine } from "../../../../src/MatrixBasedStateMachine";
import { ITurnstile } from "../../base/ITurnstile";

// Device simulators

const coinAcceptor = new CoinAcceptor();
const barrierArms = new BarrierArms();
const statusIndicator = new StatusIndicator();
const bell = new Buzzer();

// Update state instances to include bell
const l = new LockedStateRealistic(coinAcceptor, statusIndicator);
const u = new UnlockedStateRealistic(barrierArms);

// Add error state
const e = new ErrorAttemptState(bell);

// Create short aliases for signals
const coin = TurnstileSignal.COIN;
const push = TurnstileSignal.PUSH;

// Transition matrix as before
const turnstileMatrixWithBell: TransitionMatrix<NonEmpty<IStateWithActions>, NonEmpty<TurnstileSignal>>  
        = transitionMatrix<IStateWithActions, TurnstileSignal>([
    [      , l , u ,  e ],
    [ coin , u ,   ,    ],
    [ push ,   , l ,    ]
]);

export class TurnstileRealisticWithBell extends MatrixBasedStateMachine<IStateWithActions, TurnstileSignal> 
    implements ITurnstile<IStateWithActions> {
    
    constructor( ){
        super(turnstileMatrixWithBell);
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