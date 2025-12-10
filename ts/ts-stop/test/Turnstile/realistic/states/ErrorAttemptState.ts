import { DefaultState } from "@vsirotin/ts-stop";
import { IStateWithActions, IStateWithAfterEntryAction } from "@vsirotin/ts-stop";
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