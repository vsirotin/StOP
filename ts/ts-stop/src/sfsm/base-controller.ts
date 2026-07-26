import { ISignalReceiver } from './interfaces';
import { ISignalSender } from './interfaces';

// ── Component–Controller contracts ──────────────────────────────────────────

/**
 * Marker interface for the Component side of the Controller–Component connection.
 *
 * Concrete Components implement this so a Controller can call back into them
 * during Workflow N1 (SFSM command → Controller → Component).
 */
export interface IComponentProxy {}

/**
 * Marker interface for the Controller side of the Controller–Component connection.
 *
 * Concrete Controllers implement this to expose typed action methods to Components
 * during Workflow N2 (User event → Component → Controller → SFSM signal).
 */
export interface IControllerProxy {}

// ── Child-role base classes ──────────────────────────────────────────────────

/**
 * Abstract base class for the signal-sending role of a Controller.
 *
 * The ControllerHub connects the SFSM as the signal target by calling
 * connectSignalTarget(sfsm). Concrete subclasses call sendSignal() to advance
 * the SFSM state machine.
 *
 * This is a plain TypeScript class with no framework dependencies.
 */
export abstract class SignalSender implements ISignalSender {

  private signalTarget: ISignalReceiver | null = null;

  /** Returns all signal names this sender may emit. */
  abstract getSignalNames(): readonly string[];

  /** Called by ControllerHub to connect the SFSM as the signal target. */
  connectSignalTarget(target: ISignalReceiver): void {
    this.signalTarget = target;
  }

  /**
   * Sends a signal to the SFSM.
   *
   * Used in both workflows:
   *   - Workflow N1: called after the Component has responded to a command.
   *   - Workflow N2: called from the IControllerProxy method triggered by a user action.
   *
   * @param name     The signal name, as listed in getSignalNames().
   * @param payload  Optional data to attach to the signal.
   */
  protected sendSignal(name: string, payload?: unknown): void {
    this.signalTarget?.receiveSignal(name, payload);
  }
}

/**
 * Abstract base class for the command-receiving role of a Controller.
 *
 * The ControllerHub routes SFSM commands to the CommandReceiver instance whose
 * getCommandNames() includes the dispatched command name.
 *
 * This is a plain TypeScript class with no framework dependencies.
 */
export abstract class CommandReceiver implements CommandReceiver {

  /** Returns all command names this receiver handles. */
  abstract getCommandNames(): readonly string[];

  /**
   * Called by ControllerHub when the SFSM dispatches a matching command.
   *
   * @param command  The command name, as listed in getCommandNames().
   * @param payload  Optional data carried with the command.
   */
  abstract receiveCommand(command: string, payload?: unknown): void;
}

// ── Controller base class ────────────────────────────────────────────────────

/**
 * Abstract base class for all Controllers in the Behaviour Architecture.
 *
 * A Controller is the central coordination unit between the SFSM and UI Components.
 * It optionally owns:
 *   - a SignalSender  — sends signals to the SFSM          (Workflows N1 and N2)
 *   - a CommandReceiver — handles commands from the SFSM   (Workflow N1)
 *
 * Both children are plain TypeScript classes set via the constructor and may be null
 * when the controller participates in only one direction of the SFSM communication.
 *
 * The Controller also manages a collection of Components it communicates with via
 * the IControllerProxy / IComponentProxy interfaces:
 *
 *   Workflow N1:  SFSM ──(command)──▶ CommandReceiver ──(IComponentProxy)──▶ Component
 *                                              └──(sendSignal via SignalSender)──▶ SFSM
 *
 *   Workflow N2:  User ──(UI event)──▶ Component ──(IControllerProxy)──▶ Controller
 *                                                        └──(sendSignal via SignalSender)──▶ SFSM
 *
 * Derived classes may be Angular services (Angular constructor injection is supported).
 */
export class BaseController implements IControllerProxy {

  protected readonly components: IComponentProxy[] = [];
  protected readonly signalSender: SignalSender | null;
  protected readonly commandReceiver: CommandReceiver | null;

  constructor(
    signalSender: SignalSender | null,
    commandReceiver: CommandReceiver | null,
  ) {
    // Runtime type validation for better error messages
    if (signalSender && typeof (signalSender as any).connectSignalTarget !== 'function') {
        throw new Error('BaseController: signalSender must implement ISignalSender');
    }
    if (commandReceiver && typeof (commandReceiver as any).getCommandNames !== 'function') {
        throw new Error('BaseController: commandReceiver must implement ICommandReceiver');
    }
    this.signalSender = signalSender;
    this.commandReceiver = commandReceiver;
  }

  /** Get the signal sender (for ControllerHub wiring) */
  getSignalSender(): SignalSender | null {
    return this.signalSender;
  }

  /** Get the command receiver (for ControllerHub wiring) */
  getCommandReceiver(): CommandReceiver | null {
    return this.commandReceiver;
  }

  /**
   * Connects a Component to this Controller.
   *
   * The Component passes itself (as IComponentProxy) and receives back an
   * IControllerProxy it can use to trigger Workflow N2 actions.
   *
   * @param component  The Component to connect.
   * @returns          This controller, typed as IControllerProxy.
   */
  connectToComponent(component: IComponentProxy): IControllerProxy {
    this.components.push(component);
    return this;
  }

  /** Returns the registered components (read-only). */
  protected getComponents(): readonly IComponentProxy[] {
    return this.components;
  }
}

