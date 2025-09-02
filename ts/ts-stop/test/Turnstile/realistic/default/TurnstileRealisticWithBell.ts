// Add these imports to existing TurnstileRealistic.ts
import { IStateWithActions } from "../../../../src/IStateWithActions";
import { NonEmpty, transitionMatrix, TransitionMatrix } from "../../../../src/TransitionMatrix";
import { TurnstileAbstract } from "../../objects/TurnstileAbstract";
import { TurnstileSignal } from "../../objects/TurnstileSignal";
import { BarrierArms } from "../devices/BarrierArms";
import { CoinAcceptor } from "../devices/CoinAcceptor";
import { StatusIndicator } from "../devices/StatusIndicator";
import { LockedStateRealistic } from "../LockedStateRealistic";
import { UnlockedStateRealistic } from "../UnlockedStateRealistic";
import { Bell } from "./devices/Bell";
import { ErrorAttemptState } from "./ErrorAttemptState";

// Device simulators

const coinAcceptor = new CoinAcceptor();
const barrierArms = new BarrierArms();
const statusIndicator = new StatusIndicator();
const bell = new Bell();

// Update state instances to include bell
const l = new LockedStateRealistic(coinAcceptor, barrierArms, statusIndicator);
const u = new UnlockedStateRealistic(coinAcceptor, barrierArms, statusIndicator);

// Add error state
const e = new ErrorAttemptState(bell);

// Create short aliases for signals
const coin = TurnstileSignal.COIN;
const push = TurnstileSignal.PUSH;

// Same transition matrix as before
const turnstileMatrixWithBell: TransitionMatrix<NonEmpty<IStateWithActions>, NonEmpty<TurnstileSignal>>  
        = transitionMatrix<IStateWithActions, TurnstileSignal>([
    [      , l , u ,  e ],
    [ coin , u ,   ,    ],
    [ push ,   , l ,    ]
]);

export class TurnstileRealisticWithBell extends TurnstileAbstract {
    constructor() {
        // Pass error state in states array to enable default state behavior
        super(turnstileMatrixWithBell);
    }
}