import { ISignalSender, ISignalReceiver } from "./interfaces";

/**
 * Base class for components that send signals. It implements the ISignalSender interface and provides a mechanism to register signal names, connect to a signal target, and send signals. Subclasses can use this base class to easily implement signal sending functionality.
 */
export class SignalSenderBase implements ISignalSender {
    private signalTarget?: ISignalReceiver;

    /**
     * Creates an instance of SignalSenderBase.
     * @param signalNames The names of the signals that this sender can send.
     */
    constructor(private signalNames: readonly string[] = []) { }

    /**
     * Connects this signal sender to a target that implements the ISignalReceiver interface. The target will receive signals sent by this sender.
     * @param target Target that implements the ISignalReceiver interface to receive signals from this sender.
     */
    connectSignalTarget(target: ISignalReceiver): void {
        this.signalTarget = target;
    }

    /**
     * Sends a signal to the connected signal target.
     * @param name The name of the signal to send.
     * @param data Optional data associated with the signal.
     */
    sendSignal(name: string, data?: unknown): void {
        if (!this.signalNames.includes(name)) {
            throw new Error(`SignalSenderBase: Signal name "${name}" is not registered.`);
        }
        this.signalTarget?.receiveSignal(name, data);
    }

    /**
     * Retrieves the names of the signals that this sender can send.
     * @returns An array of signal names.
     */
    getSignalNames(): readonly string[] {
        return this.signalNames;
    }
}
