import { DefaultState } from "../../../../src/DefaultState";
import { IStateWithActions } from "../../../../src/IStateWithActions";
import { Buzzer } from "../devices/Buzzer";

/**
 * Error state that handles invalid operations by ringing a bell.
 */
export class ErrorAttemptState extends DefaultState implements IStateWithActions {

    constructor(
         public bell: Buzzer
    ) {
        super();
    }
    
    isDefaultState(): boolean {
        return true;
    }

    afterEntryAction(): void {
        this.bell.buzz();
    }

    beforeExitAction(): void {
        // No exit action needed
    }

}