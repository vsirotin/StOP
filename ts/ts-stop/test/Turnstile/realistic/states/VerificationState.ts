import { IStateWithActions } from "../../../../src/IStateWithActions";


/**
 * Error state that handles invalid operations by ringing a bell.
 */
export class VerificationState implements IStateWithActions {

    constructor() {}
    
    isDefaultState(): boolean {
        return true;
    }

    afterEntryAction(): void {

    }

    beforeExitAction(): void {
        // No exit action needed
    }

}