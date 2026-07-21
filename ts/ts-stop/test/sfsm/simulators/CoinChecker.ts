import { ICommandReceiver, SignalSender } from '../../../src/sfsm';

/**
 * Simulator for the Coin Checker device.
 * Receives commands CC.cw$ (check weight) and CC.cf$ (check form).
 * Always responds that the coin is valid — fires CC.p$ back to the SFSM.
 *
 * In tests that require a rejected coin, construct with rejectOnNext=true.
 */
export class CoinChecker extends SignalSender implements ICommandReceiver {

    private _rejectOnNext = false;

    getSignalNames(): readonly string[] {
        return ['CC.p$', 'CC.r$'];
    }

    getCommandNames(): readonly string[] {
        return ['CC.cw$', 'CC.cf$'];
    }

    setRejectOnNext(reject: boolean): void {
        this._rejectOnNext = reject;
    }

    receiveCommand(command: string, data?: unknown): void {
        if (command === 'CC.cw$' || command === 'CC.cf$') {
            if (this._rejectOnNext) {
                this._rejectOnNext = false;
                this.sendSignal('CC.r$', data);
            } else {
                this.sendSignal('CC.p$', data);
            }
        }
    }
}
