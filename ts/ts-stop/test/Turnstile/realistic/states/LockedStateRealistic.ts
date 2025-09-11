import { IStateWithActions } from "../../../../src/IStateWithActions";
import { CoinAcceptor } from "../devices/CoinAcceptor";
import { StatusIndicator } from "../devices/StatusIndicator";

/**
 * Locked state with integrated technical device control.
 */
export class LockedStateRealistic implements IStateWithActions {
    constructor(
        public coinAcceptor: CoinAcceptor,
        public statusIndicator: StatusIndicator
    ) {}

    /**
     * Action executed after entering the locked state.
     */
    afterEntryAction(): void {

        // Configure devices for locked state
        this.coinAcceptor.openSlot();           // Ready to receive payments
        this.statusIndicator.showRed();         // Indicate access denied
    }

    /**
     * Action executed before exiting the locked state.
     */
    beforeExitAction(): void {
       this.coinAcceptor.closeSlot();  // Stop receiving payments
       this.statusIndicator.showGreen(); // Turn off status indicator
  
    }

    toString(): string {
        return "locked";
    }
}