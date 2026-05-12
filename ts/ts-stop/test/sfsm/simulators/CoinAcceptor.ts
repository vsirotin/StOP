import { ICommandReceiver, ISignalReceiver, ISignalSender } from '../../../src/sfsm';

/**
 * Simulator for the Coin Acceptor device.
 * Receives command CA.a$ (accept coin).
 * Computes change = coinValue - fare.
 * - If change > 0: fires CA.c$ with { value: change } back to the SFSM.
 * - If change <= 0: fires CA.n (no change needed).
 *
 * @param fare The price of passage. Defaults to 1.
 */
export class CoinAcceptor implements ICommandReceiver, ISignalSender {

    private sfsm: ISignalReceiver | null = null;

    constructor(private fare: number = 1) {}

    connectSignalTarget(target: ISignalReceiver): void {
        this.sfsm = target;
    }

    receiveCommand(command: string, data?: unknown): void {
        if (command === 'CA.a$') {
            const coin = data as { value: number };
            const change = coin.value - this.fare;
            if (change > 0) {
                this.sfsm!.receiveSignal('CA.c$', { value: change });
            } else {
                this.sfsm!.receiveSignal('CA.n');
            }
        }
    }
}
