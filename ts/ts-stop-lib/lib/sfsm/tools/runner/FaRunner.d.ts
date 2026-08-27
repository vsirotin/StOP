import { Sfsm } from '../../Sfsm';
import { CommandInterpreter } from './CommandInterpreter';
/**
 * FaRunner — a didactical helper that drives a loaded `Sfsm` through a
 * predefined sequence of signals and, optionally, reacts to the commands the
 * FA emits along the way.
 *
 * ## What it does
 *
 * 1. **Feeds signals.** You hand it a list of signals (e.g.
 *    `["start", "coin", "push"]`) and call `run()`. The runner sends them one
 *    by one to `sfsm.receiveSignal(...)`, advancing the FA through its
 *    transitions.
 *
 * 2. **Closes the command loop.** When the constructor runs, the runner
 *    registers an internal `ICommandReceiver` on the Sfsm (via
 *    `sfsm.setCommandReceiver(...)`). From that point on, every transition that
 *    carries a command (a quadruple `<s0, g, s1, c>`) triggers the runner's
 *    `handleCommand`:
 *      - If a `CommandInterpreter` has been set, the command is translated into
 *        a signal and fed straight back into the FA. This lets the FA drive
 *        itself: it emits a command, the runner turns it into the next signal.
 *      - If no interpreter is set, the runner simply consumes the next signal
 *        from the provided list. This is useful for FAs whose transitions have
 *        no commands (plain triples) — the command callback then acts as a
 *        "tick" that pulls the next pre-scripted signal.
 *
 * 3. **Reports the run.** `run()` returns a human-readable, line-by-line trace
 *    of every transition the Sfsm logged during the run, in the form:
 *
 *        from-state, signal, to-state, command
 *
 *    (the `, command` part is omitted when the transition had no command).
 *    This is invaluable for tutorials, debugging, and regression tests: you can
 *    see at a glance which path the FA took.
 *
 * ## Design note: composition over implementation
 *
 * `FaRunner` does **not** implement `ICommandReceiver` itself. Instead it owns
 * a tiny internal class (`CommandReceiver`) that does. This keeps the runner's
 * public API clean (only `run()` and `setCommandInterpreter()` are exposed)
 * while still giving the Sfsm a proper `ICommandReceiver` (including the
 * `getCommandNames()` contract) to call back.
 *
 * ## Example
 *
 * ```typescript
 * const sfsm = new Sfsm(turnstileFa);
 *
 * const runner = new FaRunner(sfsm, ["start", "coin", "push"]);
 * const trace = runner.run();
 * // trace:
 * //   I, start, locked
 * //   locked, coin, unlocked
 * //   unlocked, push, locked
 * ```
 */
export declare class FaRunner {
    private readonly sfsm;
    private readonly signals;
    private signalIndex;
    private interpreter;
    /**
     * Internal command receiver registered on the Sfsm.
     *
     * It is a dedicated internal class (`CommandReceiver`) that implements
     * `ICommandReceiver` and delegates `receiveCommand` to the runner's private
     * `handleCommand`. By composing instead of implementing the interface on
     * `FaRunner` itself, we avoid leaking `receiveCommand` / `getCommandNames`
     * into the runner's public API.
     */
    private readonly commandReceiver;
    /**
     * @param sfsm - A `Sfsm` instance that has already been loaded with an FA
     *        via `loadFA(...)`. The runner registers itself (through its
     *        internal command receiver) on this Sfsm, so any command emitted by
     *        a transition will be routed back to the runner.
     * @param signals - An ordered list of signals to feed into the FA when
     *        `run()` is called, or when a command arrives and no
     *        `CommandInterpreter` is set. The list is copied defensively.
     */
    constructor(sfsm: Sfsm, signals: string[]);
    /**
     * Install a `CommandInterpreter`. Once set, every command emitted by the
     * FA is translated into a signal (via `interpreter.interpretCommand`) and
     * sent back into the FA. Until this is called, commands cause the runner to
     * pull the next signal from the constructor's signal list instead.
     *
     * @param interpreter - The interpreter to use, or `null` to revert to the
     *        "consume next signal from the list" behaviour.
     */
    setCommandInterpreter(interpreter: CommandInterpreter | null): void;
    /**
     * Send every remaining signal from the constructor's list, in order, to the
     * Sfsm and return a trace of the transitions that were logged as a result.
     *
     * Each line of the returned string describes one transition:
     *
     *     from-state, signal, to-state, command
     *
     * The `, command` segment is omitted for transitions that carry no command
     * (plain triples). The trace is built from `sfsm.getLog()`, sliced to only
     * those entries produced during this `run()` call.
     *
     * @returns A multi-line string, one line per transition logged during the
     *          run. If no transitions were logged, an empty string is returned.
     */
    run(): string;
    /**
     * Handle a command emitted by the FA. This is called by the internal
     * `ICommandReceiver` registered on the Sfsm.
     *
     * Two modes:
     *  1. **Interpreter set** — translate the command into a signal and send it
     *     back into the FA. The FA is effectively self-driving: it emits a
     *     command, the runner turns it into the next signal.
     *  2. **No interpreter** — consume the next signal from the constructor's
     *     list and send that. This is the fallback for FAs whose transitions
     *     have no commands; the command callback then acts as a "tick" that
     *     advances the pre-scripted sequence.
     *
     * @param command - The command name emitted by the FA.
     * @param data - Optional data payload carried by the triggering signal.
     * @throws {Error} If no interpreter is set and the signal list is exhausted.
     */
    private handleCommand;
    /**
     * Internal `ICommandReceiver` used to close the command loop.
     *
     * This is a private static nested class that fully implements the
     * `ICommandReceiver` contract. Its only public surface is the two members
     * the interface requires; everything else about the runner stays private.
     *
     * - `getCommandNames()` returns an empty list because the runner can react
     *   to *any* command the FA emits — it does not restrict itself to a fixed
     *   set of names.
     * - `receiveCommand()` forwards straight to the owning runner's private
     *   `handleCommand`, which decides between interpreting the command or
     *   consuming the next pre-scripted signal.
     */
    private static CommandReceiver;
}
//# sourceMappingURL=FaRunner.d.ts.map