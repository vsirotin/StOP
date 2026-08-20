/**
 * Base class for components that receive commands. It implements the ICommandReceiver interface and provides a mechanism to register command names and handle received commands. Subclasses must implement the handleCommand method to define specific behavior for each command.
 */
export class CommandReceiverBase {
    /**
     * @param commandNames The names of the commands that this receiver can handle.
     */
    /**
     * Creates an instance of CommandReceiverBase.
     * @param commandNames The names of the commands that this receiver can handle.
     */
    constructor(commandNames = []) {
        this.commandNames = commandNames;
    }
    /**
     * Retrieves the names of the commands that this receiver can handle.
     * @returns commandNames An array of command names.
     */
    getCommandNames() {
        return this.commandNames;
    }
    /**
     * Handles a received command.
     * @param command The name of the received command.
     * @param data Optional data associated with the command.
     */
    receiveCommand(command, data) {
        if (!this.commandNames.includes(command)) {
            throw new Error(`CommandReceiverBase: Command name "${command}" is not registered.`);
        }
        this.handleCommand(command, data);
    }
}
