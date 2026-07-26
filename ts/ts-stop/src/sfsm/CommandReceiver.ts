import { ICommandReceiver } from './interfaces';

/**
 * Abstract base class for the command-receiving role of an external-world component
 * (a "Controller" in ControllerHub terminology).
 *
 * Concrete subclasses declare the command names they handle via getCommandNames()
 * (read by ControllerHub for routing and diagnostics — no need to repeat the list
 * again at the registration call site) and implement receiveCommand() to react to
 * commands dispatched by the SFSM.
 *
 * A component that both sends signals and receives commands should extend
 * SignalSender and additionally implement this class's contract directly
 * (getCommandNames / receiveCommand) — TypeScript does not allow extending two
 * classes, but structurally implementing this abstract class's shape is sufficient
 * for ControllerHub.registerCommandReceiver().
 */
export abstract class CommandReceiver implements ICommandReceiver {

    /** Returns all command names this receiver handles. */
    abstract getCommandNames(): readonly string[];

    /** Called by ControllerHub when the SFSM dispatches a matching command. */
    abstract receiveCommand(command: string, data?: unknown): void;
}
