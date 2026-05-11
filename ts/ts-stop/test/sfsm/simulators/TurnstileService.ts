import { ISignalReceiver } from '../../../src/sfsm';

/**
 * Simulator for the entity that sends the "TS.s" (system start) signal to the SFSM.
 * In the real system this is typically the application startup code.
 * Call start() once after loadFA() to move the turnstile from state I → L.
 */
export class TurnstileService {

    constructor(private sfsm: ISignalReceiver) {}

    start(): void {
        this.sfsm.receiveSignal('TS.s');
    }
}
