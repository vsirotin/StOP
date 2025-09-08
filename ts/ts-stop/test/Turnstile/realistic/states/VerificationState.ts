import { IDefaultState } from "../../../../src/IDefaultState";
import { IStateWithActions } from "../../../../src/IStateWithActions";
import { Bell } from "../devices/Bell";
import { CoinAcceptorWithMemory } from "../devices/CoinAcceptor";

/**
 * Error state that handles invalid operations by ringing a bell.
 */
export class VerificationState implements IStateWithActions {

    constructor(
          public coinAcceptor: CoinAcceptorWithMemory) {}
    
    isDefaultState(): boolean {
        return true;
    }

    afterEntryAction(): void {

    }

    beforeExitAction(): void {
        // No exit action needed
    }

}