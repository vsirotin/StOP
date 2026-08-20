/**
 * Base class for components that send signals. It implements the ISignalSender interface and provides a mechanism to register signal names, connect to a signal target, and send signals. Subclasses can use this base class to easily implement signal sending functionality.
 */
export class SignalSenderBase {
    /**
     * Creates an instance of SignalSenderBase.
     * @param signalNames The names of the signals that this sender can send.
     */
    constructor(signalNames = []) {
        this.signalNames = signalNames;
    }
    /**
     * Connects this signal sender to a target that implements the ISignalReceiver interface. The target will receive signals sent by this sender.
     * @param target Target that implements the ISignalReceiver interface to receive signals from this sender.
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
            throw new Error(`SignalSenderBase: Signal name "${name}" is not registered.`);
        }
        (_a = this.signalTarget) === null || _a === void 0 ? void 0 : _a.receiveSignal(name, data);
    }
    /**
     * Retrieves the names of the signals that this sender can send.
     * @returns An array of signal names.
     */
    getSignalNames() {
        return this.signalNames;
    }
}
