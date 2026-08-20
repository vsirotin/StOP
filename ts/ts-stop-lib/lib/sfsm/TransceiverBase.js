"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransceiverBase = void 0;
/**
 * Base class for components that can both send signals and receive commands. It implements the ITransceiver interface and provides a mechanism to register signal names and command names, connect to a signal target, send signals, and receive commands. Subclasses can use this base class to easily implement transceiver functionality.
 */
class TransceiverBase {
    /**
     * Creates an instance of TransceiverBase.
     * @param signalNames The names of the signals that this transceiver can send.
     * @param commandNames The names of the commands that this transceiver can handle.
     */
    constructor(signalNames = [], commandNames = []) {
        this.signalNames = signalNames;
        this.commandNames = commandNames;
    }
    /**
     * Retrieves the names of the signals that this transceiver can send.
     * @returns An array of signal names.
     */
    getSignalNames() {
        return this.signalNames;
    }
    /**
     * Retrieves the names of the commands that this transceiver can handle.
     * @returns An array of command names.
     */
    getCommandNames() {
        return this.commandNames;
    }
    /**
     * Connects this transceiver to a target that implements the ISignalReceiver interface. The target will receive signals sent by this transceiver.
     * @param target Target that implements the ISignalReceiver interface to receive signals from this transceiver.
     */
    connectSignalTarget(target) {
        this.signalTarget = target;
    }
    /**
     * Sends a signal to the connected signal target.
     * @param name The name of the signal to send.
     * @param data Optional data associated with the signal.
     */
    sendSignal(name, data) {
        var _a;
        if (!this.signalNames.includes(name)) {
            throw new Error(`TransceiverBase: Signal name "${name}" is not registered.`);
        }
        (_a = this.signalTarget) === null || _a === void 0 ? void 0 : _a.receiveSignal(name, data);
    }
    /**
     * Receives a command and delegates it to the handleCommand method for processing. If the command name is not registered, an error is thrown.
     * @param command The name of the command to receive.
     * @param data Optional data associated with the command.
     */
    receiveCommand(command, data) {
        if (!this.commandNames.includes(command)) {
            throw new Error(`TransceiverBase: Command name "${command}" is not registered.`);
        }
        this.handleCommand(command, data);
    }
}
exports.TransceiverBase = TransceiverBase;
//# sourceMappingURL=TransceiverBase.js.map