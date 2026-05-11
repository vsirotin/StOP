import { ICommandReceiver } from '../../../src/sfsm';

/**
 * Routes commands to the appropriate simulator based on command prefix.
 * Register simulators by their command prefix (e.g. 'TS', 'CC', 'CA', 'CH').
 */
export class CommandRouter implements ICommandReceiver {

    private routes = new Map<string, ICommandReceiver>();

    register(prefix: string, receiver: ICommandReceiver): void {
        this.routes.set(prefix, receiver);
    }

    receiveCommand(command: string, data?: unknown): void {
        const prefix = command.split('.')[0];
        const receiver = this.routes.get(prefix);
        if (!receiver) {
            throw new Error(`CommandRouter: no receiver registered for prefix "${prefix}" (command: "${command}")`);
        }
        receiver.receiveCommand(command, data);
    }
}
