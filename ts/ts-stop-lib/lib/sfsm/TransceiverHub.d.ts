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
 */
export declare class TransceiverHub implements ICommandReceiver {
    private sfsm;
    private transceivers;
    private commandRoutes;
    private signalSenders;
    constructor(sfsm: Sfsm, transceivers?: readonly ITransceiver[]);
    /**
     * Register a signal sender. Its signal names (getSignalNames()) are used for
     * diagnostics via getRegisteredSignals().
     * Fluent — returns this.
     */
    registerSignalSender(sender: ISignalSender): this;
    /**
     * Register a command receiver for all command names it declares via getCommandNames().
     * Throws if any of those command names is already registered.
     * Fluent — returns this.
     */
    registerCommandReceiver(receiver: ICommandReceiver): this;
    /** ICommandReceiver implementation — dispatches command to the registered receiver. */
    receiveCommand(command: string, data?: unknown): void;
    /** Returns all command names that have a registered receiver (for diagnostics / validation). */
    getRegisteredCommands(): string[];
    /** Returns all signal names that have a registered sender (for diagnostics / validation). */
    getRegisteredSignals(): string[];
    getCommandNames(): readonly string[];
}
/**
 * Utility function to wire an SFSM with a collection of transceivers, signal senders, and command receivers.
 * Returns the TransceiverHub instance that was created and wired.
 */
export declare function wireSfsm(sfsm: Sfsm, transceivers?: readonly ITransceiver[], signalSenders?: readonly ISignalSender[], commandReceivers?: readonly ICommandReceiver[]): TransceiverHub;
//# sourceMappingURL=TransceiverHub.d.ts.map