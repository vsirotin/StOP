import { ICommandReceiver, ISignalReceiver } from '../../../src/sfsm';

/**
 * Simulator for the Banknote Acceptor device.
 * Receives command BA.a$ (accept banknote).
 * Computes change = banknoteValue - fare.
 * - If change > 0: fires BA.c$ with { value: change } back to the SFSM.
 * - If change <= 0: fires BA.n (no change needed).
 *
 * @param fare The price of passage. Defaults to 1.
 */
export class BanknoteAcceptor implements ICommandReceiver {

    private sfsm: ISignalReceiver | null = null;

    constructor(private fare: number = 1) {}

    connectSfsm(sfsm: ISignalReceiver): void {
        this.sfsm = sfsm;
    }

    receiveCommand(command: string, data?: unknown): void {
        if (command === 'BA.a$') {
            const banknote = data as { value: number };
            const change = banknote.value - this.fare;
            if (change > 0) {
                this.sfsm!.receiveSignal('BA.c$', { value: change });
            } else {
                this.sfsm!.receiveSignal('BA.n');
            }
        }
    }
}
