import { IDefaultState } from "../../../../src/IDefaultState";
import { IStateWithActions } from "../../../../src/IStateWithActions";
import { Buzzer } from "../devices/Buzzer";

/**
 * Error state that handles invalid operations by ringing a bell.
 */
export class ErrorAttemptState implements IStateWithActions, IDefaultState {

    constructor(
         public bell: Buzzer
    ) {}
    
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