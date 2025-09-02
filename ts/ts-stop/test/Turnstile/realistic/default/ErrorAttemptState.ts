import { IDefaultState } from "../../../../src/IDefaultState";
import { IStateWithActions } from "../../../../src/IStateWithActions";
import { Bell } from "./devices/Bell";

/**
 * Error state that handles invalid operations by ringing a bell.
 */
export class ErrorAttemptState implements IStateWithActions, IDefaultState {

    constructor(
         public bell: Bell
    ) {}
    
    isDefaultState(): boolean {
        return true;
    }

    afterEntryAction(): void {
        this.bell.ring();
        console.log("Invalid operation!");
    }

    beforeExitAction(): void {
        // No exit action needed
    }

}