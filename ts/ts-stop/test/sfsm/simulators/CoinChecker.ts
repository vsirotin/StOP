import { ICommandReceiver, ISignalReceiver, ISignalSender } from '../../../src/sfsm';

/**
 * Simulator for the Coin Checker device.
 * Receives commands CC.cw$ (check weight) and CC.cf$ (check form).
 * Always responds that the coin is valid — fires CC.p$ back to the SFSM.
 *
 * In tests that require a rejected coin, construct with rejectOnNext=true.
 */
export class CoinChecker implements ICommandReceiver, ISignalSender {

    private sfsm: ISignalReceiver | null = null;
    private _rejectOnNext = false;

    connectSignalTarget(target: ISignalReceiver): void {
        this.sfsm = target;
    }

    setRejectOnNext(reject: boolean): void {
        this._rejectOnNext = reject;
    }

    receiveCommand(command: string, data?: unknown): void {
        if (command === 'CC.cw$' || command === 'CC.cf$') {
            if (this._rejectOnNext) {
                this._rejectOnNext = false;
                this.sfsm!.receiveSignal('CC.r$', data);
            } else {
                this.sfsm!.receiveSignal('CC.p$', data);
            }
        }
    }
}
