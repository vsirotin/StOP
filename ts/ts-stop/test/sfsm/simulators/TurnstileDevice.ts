import { ICommandReceiver, SignalSender } from '../../../src/sfsm';

/**
 * Simulator for the Turnstile physical device.
 * Receives commands TS.l (lock) and TS.ut (unlock-with-timeout).
 * Can emit signals TS.ps (passage) and TS.to (timeout) back to the SFSM.
 *
 * In tests, call triggerPassage() or triggerTimeout() to simulate physical events.
 */
export class TurnstileDevice extends SignalSender implements ICommandReceiver {

    private _locked = true;
    private commandsReceived: string[] = [];

    getSignalNames(): readonly string[] {
        return ['TS.to', 'TS.ps'];
    }

    getCommandNames(): readonly string[] {
        return ['TS.ut', 'TS.l'];
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
        this.sendSignal('TS.ps');
    }

    triggerTimeout(): void {
        this.sendSignal('TS.to');
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
