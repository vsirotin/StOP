import { ICommandReceiver, ISignalSender, ITransceiver } from './interfaces';
import { Sfsm } from './Sfsm';


/**
 * Wiring hub between the SFSM and a collection of Controllers — components that
 * play the SignalSender and/or CommandReceiver role for the "external world".
 *
 * - registerSignalSender(sender) — wires a SignalSender; its signal names are
 *   read from sender.getSignalNames(), so they never need to be repeated here.
 * - registerCommandReceiver(receiver) — wires a CommandReceiver; its command names
 *   are read from receiver.getCommandNames(). Throws if a command name is already
 *   registered by another receiver.
 * - connectTo(sfsm) — wires everything: sets itself as the SFSM's command receiver
 *   and calls connectSignalTarget(sfsm) on every registered signal sender.
 *
 * A single component that plays both roles (most real devices do) extends
 * SignalSender and additionally implements the CommandReceiver contract on the
 * same class, then is registered once with each method:
 *
 *   new TransceiverHub()
 *     .registerSignalSender(turnstileService)
 *     .registerSignalSender(turnstileDevice)
 *     .registerCommandReceiver(turnstileDevice)
 *     .connectTo(sfsm);
 */
export class TransceiverHub implements ICommandReceiver {

    private commandRoutes = new Map<string, ICommandReceiver>();
    private signalSenders: ISignalSender[] = [];


    constructor(sfsm: Sfsm = new Sfsm(), transceivers: readonly ITransceiver[] = []) {
        for (const transceiver of transceivers) {
        // Workflow N1 + N2: wire the SFSM as the signal target for this transceiver's sender.
        const signalSender = transceiver;
        signalSender?.connectSignalTarget(sfsm);

        // Build command routing table from this transceiver's CommandReceiver.
        const commandReceiver = transceiver;
        if (commandReceiver) {
            for (const cmd of commandReceiver.getCommandNames()) {
                if (this.commandRoutes.has(cmd)) {
                    throw new Error(`TransceiverHub: command "${cmd}" is already registered`);
                }
                this.commandRoutes.set(cmd, commandReceiver);
                }
            }
        }

        // Register this hub as the single ICommandReceiver of the SFSM.
        // All SFSM commands will flow through receiveCommand() and be dispatched
        // to the appropriate CommandReceiver via commandRoutes.
        sfsm.setCommandReceiver(this);
    }

    /**
     * Register a signal sender. Its signal names (getSignalNames()) are used for
     * diagnostics via getRegisteredSignals().
     * Fluent — returns this.
     */
    registerSignalSender(sender: ISignalSender): this {
        this.signalSenders.push(sender);
        return this;
    }

    /**
     * Register a command receiver for all command names it declares via getCommandNames().
     * Throws if any of those command names is already registered.
     * Fluent — returns this.
     */
    registerCommandReceiver(receiver: ICommandReceiver): this {
        for (const cmd of receiver.getCommandNames()) {
            if (this.commandRoutes.has(cmd)) {
                throw new Error(`TransceiverHub: command "${cmd}" is already registered`);
            }
            this.commandRoutes.set(cmd, receiver);
        }
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
        for (const sender of this.signalSenders) {
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
                `TransceiverHub: no receiver registered for command "${command}". ` +
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
        return this.signalSenders.flatMap(s => s.getSignalNames());
    }

    getCommandNames(): readonly string[] {
        return [...this.commandRoutes.keys()];
    }
}
