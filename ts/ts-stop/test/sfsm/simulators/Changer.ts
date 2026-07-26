import { ICommandReceiver, SignalSender } from '../../../src/sfsm';

/**
 * Simulator for the Changer device.
 * Receives command CH.c$ (make change with given amount).
 * After dispensing, fires CH.d (change done) back to the SFSM.
 */
export class Changer extends SignalSender implements ICommandReceiver {

    private lastChangeAmount: number | null = null;

    getSignalNames(): readonly string[] {
        return ['CH.d'];
    }

    getCommandNames(): readonly string[] {
        return ['CH.c$'];
    }

    receiveCommand(command: string, data?: unknown): void {
        if (command === 'CH.c$') {
            this.lastChangeAmount = (data as { value: number }).value;
            this.sendSignal('CH.d');
        }
    }

    getLastChangeAmount(): number | null {
        return this.lastChangeAmount;
    }
}
