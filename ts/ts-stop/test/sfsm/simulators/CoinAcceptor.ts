import { ICommandReceiver, SignalSender } from '../../../src/sfsm';

/**
 * Simulator for the Coin Acceptor device.
 * Receives command CA.a$ (accept coin).
 * Computes change = coinValue - fare.
 * - If change > 0: fires CA.c$ with { value: change } back to the SFSM.
 * - If change <= 0: fires CA.n (no change needed).
 *
 * @param fare The price of passage. Defaults to 1.
 */
export class CoinAcceptor extends SignalSender implements ICommandReceiver {

    constructor(private fare: number = 1) { super(); }

    getSignalNames(): readonly string[] {
        return ['CA.c$', 'CA.n'];
    }

    getCommandNames(): readonly string[] {
        return ['CA.a$'];
    }

    receiveCommand(command: string, data?: unknown): void {
        if (command === 'CA.a$') {
            const coin = data as { value: number };
            const change = coin.value - this.fare;
            if (change > 0) {
                this.sendSignal('CA.c$', { value: change });
            } else {
                this.sendSignal('CA.n');
            }
        }
    }
}
