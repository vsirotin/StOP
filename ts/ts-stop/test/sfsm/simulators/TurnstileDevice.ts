import { ICommandReceiver, ISignalReceiver } from '../../../src/sfsm';

/**
 * Simulator for the Turnstile physical device.
 * Receives commands TS.l (lock) and TS.ut (unlock-with-timeout).
 * Can emit signals TS.ps (passage) and TS.to (timeout) back to the SFSM.
 *
 * In tests, call triggerPassage() or triggerTimeout() to simulate physical events.
 */
export class TurnstileDevice implements ICommandReceiver {

    private sfsm: ISignalReceiver | null = null;
    private _locked = true;
    private commandsReceived: string[] = [];

    connectSfsm(sfsm: ISignalReceiver): void {
        this.sfsm = sfsm;
    }

    receiveCommand(command: string, _data?: unknown): void {
        this.commandsReceived.push(command);
        if (command === 'TS.l') {
            this._locked = true;
        } else if (command === 'TS.ut') {
            this._locked = false;
        }
    }

    triggerPassage(): void {
        this.sfsm!.receiveSignal('TS.ps');
    }

    triggerTimeout(): void {
        this.sfsm!.receiveSignal('TS.to');
    }

    isLocked(): boolean {
        return this._locked;
    }

    getCommandsReceived(): string[] {
        return [...this.commandsReceived];
    }

    reset(): void {
        this._locked = true;
        this.commandsReceived = [];
    }
}
