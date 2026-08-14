/**
 * Interface for objects that can receive commands from the SFSM.
 * Implement this interface for any device in the "external world" that the SFSM controls.
 */
export interface ICommandReceiver {

    /** Returns all command names this receiver handles. */
    getCommandNames(): readonly string[];

    /** Called by TransceiverHub when the SFSM dispatches a matching command. */
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
 * TransceiverHub calls connectSignalTarget() on every registered sender during connectTo().
 */
export interface ISignalSender {

     /** Called  to connect the SFSM (or any receiver) as the signal target. */
    connectSignalTarget(target: ISignalReceiver): void; 

    /** Sends a signal to the connected target (normally the SFSM). */
    sendSignal(name: string, data?: unknown): void; 

    /** Returns all signal names this sender may emit. */
    getSignalNames(): readonly string[];
}

/**
 * Interface for objects that can both send signals and receive commands.
 */
export interface ITransceiver extends ISignalSender, ICommandReceiver {}
