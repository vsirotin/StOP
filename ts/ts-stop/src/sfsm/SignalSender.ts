import { ISignalReceiver, ISignalSender } from './interfaces';

/**
 * Abstract base class for the signal-sending role of an external-world component
 * (a "Controller" in ControllerHub terminology).
 *
 * Concrete subclasses:
 *   - declare the signal names they may emit via getSignalNames()
 *     (read by ControllerHub for wiring and diagnostics — no need to repeat the
 *     list again at the registration call site);
 *   - call the protected sendSignal() to push a signal to the connected target
 *     (normally the SFSM).
 *
 * ControllerHub calls connectSignalTarget() automatically during connectTo().
 */
export abstract class SignalSender implements ISignalSender {

    private signalTarget: ISignalReceiver | null = null;

    /** Returns all signal names this sender may emit. */
    abstract getSignalNames(): readonly string[];

    /** Called by ControllerHub to connect the SFSM (or any receiver) as the signal target. */
    connectSignalTarget(target: ISignalReceiver): void {
        this.signalTarget = target;
    }

    /** Sends a signal to the connected target (normally the SFSM). */
    protected sendSignal(name: string, data?: unknown): void {
        this.signalTarget?.receiveSignal(name, data);
    }
}
