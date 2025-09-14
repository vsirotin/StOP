import { DefaultState } from "../../../../src/DefaultState";
import { IStateWithActions, IStateWithAfterEntryAction } from "../../../../src/IStateWithActions";
import { Buzzer } from "../devices/Buzzer";

/**
 * Error state that handles invalid operations by using a buzzer.
 */
export class ErrorAttemptState extends DefaultState implements IStateWithAfterEntryAction {

    constructor(
         public buzzer: Buzzer
    ) {
        super();
    }

    afterEntryAction(): void {
        this.buzzer.buzz();
    }
}