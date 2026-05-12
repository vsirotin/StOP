import { ICommandReceiver, ISignalReceiver, ISignalSender } from '../../../src/sfsm';

/**
 * Simulator for the Changer device.
 * Receives command CH.c$ (make change with given amount).
 * After dispensing, fires CH.d (change done) back to the SFSM.
 */
export class Changer implements ICommandReceiver, ISignalSender {

    private sfsm: ISignalReceiver | null = null;
    private lastChangeAmount: number | null = null;

    connectSignalTarget(target: ISignalReceiver): void {
        this.sfsm = target;
    }

    receiveCommand(command: string, data?: unknown): void {
        if (command === 'CH.c$') {
            this.lastChangeAmount = (data as { value: number }).value;
            this.sfsm!.receiveSignal('CH.d');
        }
    }

    getLastChangeAmount(): number | null {
        return this.lastChangeAmount;
    }
}
