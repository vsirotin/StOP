import { ICommandReceiver, SignalSender } from '../../../src/sfsm';

/**
 * Simulator for the Banknote Checker device.
 * Receives command BC.c$ (check banknote).
 * Always responds that the banknote is valid — fires BC.p$ back to the SFSM.
 *
 * Call setRejectOnNext(true) to make it reject the next banknote instead.
 */
export class BanknoteChecker extends SignalSender implements ICommandReceiver {

    private _rejectOnNext = false;

    getSignalNames(): readonly string[] {
        return ['BC.p$', 'BC.r$'];
    }

    getCommandNames(): readonly string[] {
        return ['BC.c$'];
    }

    setRejectOnNext(reject: boolean): void {
        this._rejectOnNext = reject;
    }

    receiveCommand(command: string, data?: unknown): void {
        if (command === 'BC.c$') {
            if (this._rejectOnNext) {
                this._rejectOnNext = false;
                this.sendSignal('BC.r$', data);
            } else {
                this.sendSignal('BC.p$', data);
            }
        }
    }
}
