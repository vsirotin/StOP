/**
 * CommandInterpreter — a small adapter that translates external "commands"
 * (human-friendly names, button labels, API calls, …) into the internal
 * "signals" that a finite automaton understands.
 *
 * In StOP terminology:
 * - A **signal** is what drives an FA forward (the second slot of a transition
 *   triple `<s0, g, s1>`).
 * - A **command** is what the FA emits to the outside world (the optional
 *   fourth slot of a transition quadruple `<s0, g, s1, c>`).
 *
 * The two vocabularies are often different: an FA's signals are usually short
 * technical identifiers (`"coin"`, `"push"`), while the external world speaks
 * in terms of events or requests (`"insertCoin"`, `"pass"`). `CommandInterpreter`
 * bridges that gap with a simple lookup table, so that a runner can feed the
 * FA by reacting to the commands the FA itself emits — closing the loop.
 *
 * Example:
 *   const interpreter = new CommandInterpreter({
 *     begin:      'start',
 *     insertCoin: 'coin',
 *     pass:       'push'
 *   });
 *   interpreter.interpretCommand('insertCoin'); // → 'coin'
 */
export declare class CommandInterpreter {
    /** A copy of the command→signal mapping provided at construction time. */
    private readonly commandToSignal;
    /**
     * @param commandToSignal - A record mapping command names to signal names.
     *        Each key is a command the FA may emit; the corresponding value is
     *        the signal that should be fed back into the FA in response.
     */
    constructor(commandToSignal: Record<string, string>);
    /**
     * Translate a command into its corresponding signal.
     *
     * @param command - The command name to look up.
     * @returns The signal name mapped to this command.
     * @throws {Error} If the command is not found in the mapping. An unknown
     *         command almost always indicates a bug (a typo, or a command the
     *         FA emits but the caller forgot to map), so we fail loudly rather
     *         than silently dropping it.
     */
    interpretCommand(command: string): string;
}
//# sourceMappingURL=CommandInterpreter.d.ts.map