import { SignalSender } from '../../../src/sfsm';

/**
 * Simulator for the entity that sends the "TS.s" (system start) signal to the SFSM.
 * In the real system this is typically the application startup code.
 * Call start() once after the hub has been connected to move the turnstile from state I → L.
 */
export class TurnstileService extends SignalSender {

    getSignalNames(): readonly string[] {
        return ['TS.s'];
    }

    start(): void {
        this.sendSignal('TS.s');
    }
}
