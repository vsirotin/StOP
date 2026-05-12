import { ICommandReceiver, ISignalReceiver, ISignalSender } from './interfaces';
import { Sfsm } from './Sfsm';

/**
 * Wiring hub between the SFSM and the "external world".
 *
 * - registerSignalSender(signals, sender) — declares which signal names a sender may emit.
 * - registerCommandReceiver(commands, receiver) — declares which commands a receiver handles.
 * - connectTo(sfsm) — wires everything: sets itself as the SFSM command receiver and
 *   calls connectSignalTarget(sfsm) on every registered signal sender.
 *
 * The explicit signal/command name lists enable precise runtime error messages and
 * provide a foundation for FA-vs-wiring validation.
 *
 * Fluent API:
 *   new ExternalWorldHub()
 *     .registerSignalSender(['TS.s'], service)
 *     .registerSignalSender(['TS.to', 'TS.ps'], device)
 *     .registerCommandReceiver(['TS.ut', 'TS.l'], device)
 *     .connectTo(sfsm);
 */
export class ExternalWorldHub implements ICommandReceiver {

    private commandRoutes = new Map<string, ICommandReceiver>();
    private signalSenders: Array<{ signals: string[]; sender: ISignalSender }> = [];

    /**
     * Register a command receiver for the given list of exact command names.
     * Throws if any command name is already registered.
     * Fluent — returns this.
     */
    registerCommandReceiver(commands: string[], receiver: ICommandReceiver): this {
        for (const cmd of commands) {
            if (this.commandRoutes.has(cmd)) {
                throw new Error(
                    `ExternalWorldHub: command "${cmd}" is already registered`
                );
            }
            this.commandRoutes.set(cmd, receiver);
        }
        return this;
    }

    /**
     * Register a signal sender for the given list of signal names.
     * Duplicate signal names across registrations are allowed (same sender may be
     * registered multiple times for documentation clarity), but will not cause
     * double-wiring — connectSignalTarget is called once per registerSignalSender call.
     * Fluent — returns this.
     */
    registerSignalSender(signals: string[], sender: ISignalSender): this {
        this.signalSenders.push({ signals, sender });
        return this;
    }

    /**
     * Wire this hub to the given SFSM instance:
     * 1. Sets this hub as the SFSM's command receiver.
     * 2. Calls connectSignalTarget(sfsm) on every registered signal sender.
     * Fluent — returns this.
     */
    connectTo(sfsm: Sfsm): this {
        sfsm.setCommandReceiver(this);
        for (const { sender } of this.signalSenders) {
            sender.connectSignalTarget(sfsm);
        }
        return this;
    }

    /** ICommandReceiver implementation — dispatches command to the registered receiver. */
    receiveCommand(command: string, data?: unknown): void {
        const receiver = this.commandRoutes.get(command);
        if (!receiver) {
            const registered = [...this.commandRoutes.keys()].join(', ');
            throw new Error(
                `ExternalWorldHub: no receiver registered for command "${command}". ` +
                `Registered commands: [${registered}]`
            );
        }
        receiver.receiveCommand(command, data);
    }

    /** Returns all command names that have a registered receiver (for diagnostics / validation). */
    getRegisteredCommands(): string[] {
        return [...this.commandRoutes.keys()];
    }

    /** Returns all signal names that have a registered sender (for diagnostics / validation). */
    getRegisteredSignals(): string[] {
        return this.signalSenders.flatMap(e => e.signals);
    }
}
