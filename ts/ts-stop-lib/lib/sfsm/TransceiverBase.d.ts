import { ISignalReceiver, ITransceiver } from "./interfaces";
/**
 * Base class for components that can both send signals and receive commands. It implements the ITransceiver interface and provides a mechanism to register signal names and command names, connect to a signal target, send signals, and receive commands. Subclasses can use this base class to easily implement transceiver functionality.
 */
export declare abstract class TransceiverBase implements ITransceiver {
    private signalNames;
    private commandNames;
    private signalTarget?;
    /**
     * Creates an instance of TransceiverBase.
     * @param signalNames The names of the signals that this transceiver can send.
     * @param commandNames The names of the commands that this transceiver can handle.
     */
    constructor(signalNames?: readonly string[], commandNames?: readonly string[]);
    /**
     * Retrieves the names of the signals that this transceiver can send.
     * @returns An array of signal names.
     */
    getSignalNames(): readonly string[];
    /**
     * Retrieves the names of the commands that this transceiver can handle.
     * @returns An array of command names.
     */
    getCommandNames(): readonly string[];
    /**
     * Connects this transceiver to a target that implements the ISignalReceiver interface. The target will receive signals sent by this transceiver.
     * @param target Target that implements the ISignalReceiver interface to receive signals from this transceiver.
     */
    connectSignalTarget(target: ISignalReceiver): void;
    /**
     * Sends a signal to the connected signal target.
     * @param name The name of the signal to send.
     * @param data Optional data associated with the signal.
     */
    sendSignal(name: string, data?: unknown): void;
    /**
     * Receives a command and delegates it to the handleCommand method for processing. If the command name is not registered, an error is thrown.
     * @param command The name of the command to receive.
     * @param data Optional data associated with the command.
     */
    receiveCommand(command: string, data?: unknown): void;
    /**
     * Handles a command received by the transceiver. Subclasses should implement this method to provide specific command handling logic.
     * @param command The name of the command to handle.
     * @param data Optional data associated with the command.
     */
    protected abstract handleCommand(command: string, data?: unknown): void;
}
//# sourceMappingURL=TransceiverBase.d.ts.map