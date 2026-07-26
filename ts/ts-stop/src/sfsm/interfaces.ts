/**
 * Interface for objects that can receive commands from the SFSM.
 * Implement this interface for any device in the "external world" that the SFSM controls.
 */
export interface ICommandReceiver {
    receiveCommand(command: string, data?: unknown): void;
}

/**
 * Interface for objects that can receive signals.
 * The SFSM implements this interface — external senders call receiveSignal() to drive it.
 */
export interface ISignalReceiver {
    receiveSignal(signal: string, data?: unknown): void;
}

/**
 * Interface for external objects that send signals to the SFSM.
 * ControllerHub calls connectSignalTarget() on every registered sender during connectTo().
 */
export interface ISignalSender {
    connectSignalTarget(target: ISignalReceiver): void;
}
