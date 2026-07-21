import { ICommandReceiver, SignalSender } from '../../../src/sfsm';

/**
 * Simulator for the Banknote Acceptor device.
 * Receives command BA.a$ (accept banknote).
 * Computes change = banknoteValue - fare.
 * - If change > 0: fires BA.c$ with { value: change } back to the SFSM.
 * - If change <= 0: fires BA.n (no change needed).
 *
 * @param fare The price of passage. Defaults to 1.
 */
export class BanknoteAcceptor extends SignalSender implements ICommandReceiver {

    constructor(private fare: number = 1) { super(); }

    getSignalNames(): readonly string[] {
        return ['BA.c$', 'BA.n'];
    }

    getCommandNames(): readonly string[] {
        return ['BA.a$'];
    }

    receiveCommand(command: string, data?: unknown): void {
        if (command === 'BA.a$') {
            const banknote = data as { value: number };
            const change = banknote.value - this.fare;
            if (change > 0) {
                this.sendSignal('BA.c$', { value: change });
            } else {
                this.sendSignal('BA.n');
            }
        }
    }
}
