import { ICommandReceiver, ISignalReceiver, ISignalSender } from '../../../src/sfsm';

/**
 * Simulator for the Banknote Checker device.
 * Receives command BC.c$ (check banknote).
 * Always responds that the banknote is valid — fires BC.p$ back to the SFSM.
 *
 * Call setRejectOnNext(true) to make it reject the next banknote instead.
 */
export class BanknoteChecker implements ICommandReceiver, ISignalSender {

    private sfsm: ISignalReceiver | null = null;
    private _rejectOnNext = false;

    connectSignalTarget(target: ISignalReceiver): void {
        this.sfsm = target;
    }

    setRejectOnNext(reject: boolean): void {
        this._rejectOnNext = reject;
    }

    receiveCommand(command: string, data?: unknown): void {
        if (command === 'BC.c$') {
            if (this._rejectOnNext) {
                this._rejectOnNext = false;
                this.sfsm!.receiveSignal('BC.r$', data);
            } else {
                this.sfsm!.receiveSignal('BC.p$', data);
            }
        }
    }
}
