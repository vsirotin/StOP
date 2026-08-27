"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalReceiverBase = void 0;
/**
 * Base class for components that receive signals. It implements the ISignalReceiver interface and provides a mechanism to register signal names, connect to a signal target, and handle received signals. Subclasses must implement the handleSignal method to define specific behavior for each signal.
 */
class SignalReceiverBase {
    /**
     * Creates an instance of SignalReceiverBase.
     * @param signalNames The names of the signals that this receiver can handle.
     */
    constructor(signalNames = []) {
        this.signalNames = [];
        this.signalNames = signalNames;
    }
    /**
     * Retrieves the names of the signals that this receiver can handle.
     * @returns signalNames An array of signal names.
     */
    getSignalNames() {
        return this.signalNames;
    }
    /**
     * Connects this signal receiver to a target that implements the ISignalReceiver interface. The target will receive signals sent by this receiver.
     * @param target Target that implements the ISignalReceiver interface to receive signals from this receiver.
     */
    connectSignalTarget(target) {
        this.signalTarget = target;
    }
    /**
     * Handles a received signal.
     * @param signal The name of the received signal.
     * @param data Optional data associated with the signal.
     */
    receiveSignal(signal, data) {
        if (!this.signalNames.includes(signal)) {
            throw new Error(`SignalReceiverBase: Signal name "${signal}" is not registered.`);
        }
        this.handleSignal(signal, data);
    }
}
exports.SignalReceiverBase = SignalReceiverBase;
//# sourceMappingURL=SignalReceiverBase.js.map