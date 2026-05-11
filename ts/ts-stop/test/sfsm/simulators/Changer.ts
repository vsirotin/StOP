import { ICommandReceiver, ISignalReceiver } from '../../../src/sfsm';

/**
 * Simulator for the Changer device.
 * Receives command CH.c$ (make change with given amount).
 * After dispensing, fires CH.d (change done) back to the SFSM.
 */
export class Changer implements ICommandReceiver {

    private sfsm: ISignalReceiver | null = null;
    private lastChangeAmount: number | null = null;

    connectSfsm(sfsm: ISignalReceiver): void {
        this.sfsm = sfsm;
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
