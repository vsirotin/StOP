import { IStateWithActions } from "../../../../src/IStateWithActions";
import { BarrierArms } from "../devices/BarrierArms";
import { CoinAcceptor } from "../devices/CoinAcceptor";
import { StatusIndicator } from "../devices/StatusIndicator";

/**
 * Locked state with integrated technical device control.
 */
export class LockedStateRealistic implements IStateWithActions {
    constructor(
        public coinAcceptor: CoinAcceptor,
        public barrierArms: BarrierArms,
        public statusIndicator: StatusIndicator
    ) {}

    /**
     * Action executed after entering the locked state.
     */
    afterEntryAction(): void {
        console.log("Start of afterEntryAction");

        // Configure devices for locked state
        this.coinAcceptor.openSlot();           // Ready to receive payments
        this.barrierArms.lock();                // Block passage
        this.statusIndicator.showRed();         // Indicate access denied
        
        console.log("🔒 Turnstile: LOCKED - Insert coin to proceed");
    }

    /**
     * Action executed before exiting the locked state.
     */
    beforeExitAction(): void {
       this.coinAcceptor.closeSlot();  // Stop receiving payments
  
    }

    toString(): string {
        return "locked";
    }
}