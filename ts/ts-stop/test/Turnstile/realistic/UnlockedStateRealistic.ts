import { IStateWithBeforeExitAction } from "../../../src/IStateWithActions";
import { BarrierArms } from "./devices/BarrierArms";
import { CoinAcceptor } from "./devices/CoinAcceptor";
import { StatusIndicator } from "./devices/StatusIndicator";
/**
 * Unlocked state with integrated technical device control.
 */
export class UnlockedStateRealistic implements  IStateWithBeforeExitAction 
 {
    constructor(
        public coinAcceptor: CoinAcceptor,
        public barrierArms: BarrierArms,
        public statusIndicator: StatusIndicator
    ) {}

    /**
     * Action executed after entering the unlocked state.
     */
    afterEntryAction(): void {
        console.log("Start of ntering unlocked state");
        
        // Configure devices for unlocked state
        this.statusIndicator.showGreen();       // Indicate access granted
        this.barrierArms.unlock();              // Allow passage
        
        console.log("🟢 Turnstile: UNLOCKED - Please proceed");
    }

        /**
     * Action executed before exiting the unlocked state.
     */
    beforeExitAction(): void {
        //Do nothing (reserved)
    }

    toString(): string {
        return "unlocked";
    }
}