import { ICommandReceiver } from "./interfaces";
/**
 * Base class for components that receive commands. It implements the ICommandReceiver interface and provides a mechanism to register command names and handle received commands. Subclasses must implement the handleCommand method to define specific behavior for each command.
 */
export declare abstract class CommandReceiverBase implements ICommandReceiver {
    private commandNames;
    /**
     * @param commandNames The names of the commands that this receiver can handle.
     */
    /**
     * Creates an instance of CommandReceiverBase.
     * @param commandNames The names of the commands that this receiver can handle.
     */
    constructor(commandNames?: readonly string[]);
    /**
     * Retrieves the names of the commands that this receiver can handle.
     * @returns commandNames An array of command names.
     */
    getCommandNames(): readonly string[];
    /**
     * Handles a received command.
     * @param command The name of the received command.
     * @param data Optional data associated with the command.
     */
    receiveCommand(command: string, data?: unknown): void;
    /**
     * Handles a command that has been received. Subclasses must implement this method to define specific behavior for each command.
     * @param command The name of the received command.
     * @param data Optional data associated with the command.
     */
    protected abstract handleCommand(command: string, data?: unknown): void;
}
//# sourceMappingURL=CommandReceiverBase.d.ts.map