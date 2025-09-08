import { IStateWithBeforeExitAction } from "../../../../src/IStateWithActions";
import { BarrierArms } from "../devices/BarrierArms";
import { StatusIndicator } from "../devices/StatusIndicator";
/**
 * Unlocked state with integrated technical device control.
 */
export class UnlockedStateRealistic implements  IStateWithBeforeExitAction 
 {
    constructor(
        public barrierArms: BarrierArms
    ) {}

    /**
     * Action executed after entering the unlocked state.
     */
    afterEntryAction(): void {
        
        // Configure devices for unlocked state
        this.barrierArms.unlock();              // Allow passage
    }

        /**
     * Action executed before exiting the unlocked state.
     */
    beforeExitAction(): void {
        this.barrierArms.lock();      // Block passage
    }

    toString(): string {
        return "unlocked";
    }
}