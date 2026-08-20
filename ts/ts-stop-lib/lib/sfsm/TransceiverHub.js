"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransceiverHub = void 0;
exports.wireSfsm = wireSfsm;
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
class TransceiverHub {
    constructor(sfsm, transceivers = []) {
        this.sfsm = sfsm;
        this.transceivers = transceivers;
        this.commandRoutes = new Map();
        this.signalSenders = [];
        for (const transceiver of transceivers) {
            // Workflow N1 + N2: wire the SFSM as the signal target for this transceiver's sender.
            const signalSender = transceiver;
            signalSender === null || signalSender === void 0 ? void 0 : signalSender.connectSignalTarget(sfsm);
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
    registerSignalSender(sender) {
        this.signalSenders.push(sender);
        sender.connectSignalTarget(this.sfsm);
        return this;
    }
    /**
     * Register a command receiver for all command names it declares via getCommandNames().
     * Throws if any of those command names is already registered.
     * Fluent — returns this.
     */
    registerCommandReceiver(receiver) {
        for (const cmd of receiver.getCommandNames()) {
            if (this.commandRoutes.has(cmd)) {
                throw new Error(`TransceiverHub: command "${cmd}" is already registered`);
            }
            this.commandRoutes.set(cmd, receiver);
        }
        return this;
    }
    /** ICommandReceiver implementation — dispatches command to the registered receiver. */
    receiveCommand(command, data) {
        const receiver = this.commandRoutes.get(command);
        if (!receiver) {
            const registered = [...this.commandRoutes.keys()].join(', ');
            throw new Error(`TransceiverHub: no receiver registered for command "${command}". ` +
                `Registered commands: [${registered}]`);
        }
        receiver.receiveCommand(command, data);
    }
    /** Returns all command names that have a registered receiver (for diagnostics / validation). */
    getRegisteredCommands() {
        return [...this.commandRoutes.keys()];
    }
    /** Returns all signal names that have a registered sender (for diagnostics / validation). */
    getRegisteredSignals() {
        return this.signalSenders.flatMap(s => s.getSignalNames());
    }
    getCommandNames() {
        return [...this.commandRoutes.keys()];
    }
}
exports.TransceiverHub = TransceiverHub;
/**
 * Utility function to wire an SFSM with a collection of transceivers, signal senders, and command receivers.
 * Returns the TransceiverHub instance that was created and wired.
 */
function wireSfsm(sfsm, transceivers = [], signalSenders = [], commandReceivers = []) {
    const hub = new TransceiverHub(sfsm, transceivers);
    for (const sender of signalSenders) {
        hub.registerSignalSender(sender);
    }
    for (const receiver of commandReceivers) {
        hub.registerCommandReceiver(receiver);
    }
    return hub;
}
//# sourceMappingURL=TransceiverHub.js.map