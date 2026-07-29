import { ICommandReceiver, SignalSender } from '../../../src/sfsm';

/**
 * Simulator for the Turnstile physical device.
 * Receives commands TS.lock (lock) and TS.unlock (unlock-with-timeout).
 * Can emit signals TS>pass (passage) and TS>timeout (timeout) back to the SFSM.
 *
 * In tests, call triggerPassage() or triggerTimeout() to simulate physical events.
 */
export class TurnstileDevice extends SignalSender implements ICommandReceiver {

    private _locked = true;
    private commandsReceived: string[] = [];

    getSignalNames(): readonly string[] {
        return ['TS>timeout', 'TS>pass'];
    }

    getCommandNames(): readonly string[] {
        return ['TS.unlock', 'TS.lock'];
    }

    receiveCommand(command: string, _data?: unknown): void {
        this.commandsReceived.push(command);
        if (command === 'TS.lock') {
            this._locked = true;
        } else if (command === 'TS.unlock') {
            this._locked = false;
        }
    }

    triggerPassage(): void {
        this.sendSignal('TS>pass');
    }

    triggerTimeout(): void {
        this.sendSignal('TS>timeout');
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
