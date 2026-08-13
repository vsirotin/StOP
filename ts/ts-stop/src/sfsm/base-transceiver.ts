import { ISignalReceiver } from './interfaces';
import { ISignalSender } from './interfaces';
import { SignalSender } from './SignalSender';
import { CommandReceiver } from './CommandReceiver';

// ── Component–Controller contracts ──────────────────────────────────────────

/**
 * Marker interface for the Component side of the Controller–Component connection.
 *
 * Concrete Components implement this so a Transceiver can call back into them
 * during Workflow N1 (SFSM command → Transceiver → Component).
 */
export interface IComponentProxy {}


// ── Transceiver base class ────────────────────────────────────────────────────

/**
 * Abstract base class for all Controllers in the Behaviour Architecture.
 *
 * A Transceiver is the central coordination unit between the SFSM and UI Components.
 * It optionally owns:
 *   - a SignalSender  — sends signals to the SFSM          (Workflows N1 and N2)
 *   - a CommandReceiver — handles commands from the SFSM   (Workflow N1)
 *
 * Both children are plain TypeScript classes set via the constructor and may be null
 * when the controller participates in only one direction of the SFSM communication.
 *
 * Derived classes may be Angular services (Angular constructor injection is supported).
 */
export class BaseTransceiver {

  protected readonly components: IComponentProxy[] = [];
  protected readonly signalSender: SignalSender | null;
  protected readonly commandReceiver: CommandReceiver | null;

  constructor(
    signalSender: SignalSender | null,
    commandReceiver: CommandReceiver | null,
  ) {
    // Runtime type validation for better error messages
    if (signalSender && typeof (signalSender as any).connectSignalTarget !== 'function') {
        throw new Error('BaseTransceiver: signalSender must implement ISignalSender');
    }
    if (commandReceiver && typeof (commandReceiver as any).getCommandNames !== 'function') {
        throw new Error('BaseTransceiver: commandReceiver must implement ICommandReceiver');
    }
    this.signalSender = signalSender;
    this.commandReceiver = commandReceiver;
  }

  /** Get the signal sender (for TransceiverHub wiring) */
  getSignalSender(): SignalSender | null {
    return this.signalSender;
  }

  /** Get the command receiver (for TransceiverHub wiring) */
  getCommandReceiver(): CommandReceiver | null {
    return this.commandReceiver;
  }

  /**
   * Connects a Component to this Transceiver.
   *
   *
   * @param component  The Component to connect.
   */
  connectToComponent(component: IComponentProxy): void {
    this.components.push(component);
  }

  /** Returns the registered components (read-only). */
  protected getComponents(): readonly IComponentProxy[] {
    return this.components;
  }
}

