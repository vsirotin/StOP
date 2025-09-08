// Add these imports to existing TurnstileRealistic.ts

import { IStateWithActions } from "../../../../src/IStateWithActions";
import { NonEmpty, transitionMatrix, TransitionMatrix } from "../../../../src/TransitionMatrix";
import { Bell } from "../devices/Bell";
import { ErrorAttemptState } from "../states/ErrorAttemptState";
import { BarrierArms } from "../devices/BarrierArms";
import { CoinAcceptor } from "../devices/CoinAcceptor";
import { StatusIndicator } from "../devices/StatusIndicator";
import { LockedStateRealistic } from "../states/LockedStateRealistic";
import { UnlockedStateRealistic } from "../states/UnlockedStateRealistic";
import { VerificationState } from "../states/VerificationState";
import { MatrixBasedStateMachine } from "../../../../src/MatrixBasedStateMachine";

// Device simulators

const coinAcceptor = new CoinAcceptor();
const barrierArms = new BarrierArms();
const statusIndicator = new StatusIndicator();
const bell = new Bell();

// Update state instances to include bell
const l = new LockedStateRealistic(coinAcceptor, barrierArms, statusIndicator);
const u = new UnlockedStateRealistic(coinAcceptor, barrierArms, statusIndicator);
const e = new ErrorAttemptState(bell);
const v = new VerificationState(coinAcceptor);

export class TurnstileRealisticSignal{};

const push  = new TurnstileRealisticSignal();
const wrong  = new TurnstileRealisticSignal();
const ok  = new TurnstileRealisticSignal();
const reset  = new TurnstileRealisticSignal();

export class SignalCoin extends TurnstileRealisticSignal {
    constructor(public value: number) {
        super();
    }
}
const coin  = new SignalCoin(0);


// Same transition matrix as before
const turnstileMatrixWithBell: TransitionMatrix<NonEmpty<IStateWithActions>, NonEmpty<TurnstileRealisticSignal>>  
        = transitionMatrix<IStateWithActions, TurnstileRealisticSignal>([
    [       , l , u ,  v,  e ],
    [ coin  , v ,   ,   ,    ],
    [ push  ,   , l ,    ,   ],
    [ reset ,   , l ,    ,   ],
    [ wrong ,   , l ,    ,   ],
    [ ok    ,   , l ,    ,   ],
]);

export class TurnstileRealisticWithSignalObjects extends MatrixBasedStateMachine<IStateWithActions, TurnstileRealisticSignal> {
    // Reference to the state objects

    constructor(matrix : TransitionMatrix<NonEmpty<IStateWithActions>, NonEmpty<TurnstileRealisticSignal>> ,
         private lockedState : IStateWithActions = matrix.getStates()[0],
         private unlockedState : IStateWithActions = matrix.getStates()[1]) 
    {
        super(matrix);
        
        // Execute initial state entry action
        this.getCurrentState().afterEntryAction();
    }

    insertCoin(value: number): IStateWithActions {
        coinAcceptor.insertCoin(value);
        return this.sendSignal(coin);
    }

    pushThrough(): IStateWithActions { 
        return this.sendSignal(push); 
    }

    reset(): IStateWithActions {        
        return this.sendSignal(reset); 
    }
}

