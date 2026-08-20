import { Sfsm, FaDefinition } from "../../src/sfsm";
import { FaRunner } from "../../src/sfsm/tools/runner/FaRunner";
import { CommandInterpreter } from "../../src/sfsm/tools/runner/CommandInterpreter";

// ===========================================================================
// FaRunner + CommandInterpreter — unit tests
//
// These tests use the three turnstile finite automata (FAs) from the StOP
// tutorial (chapters 1 and 3) to demonstrate how FaRunner drives an Sfsm:
//
//   1. The basic turnstile — a flat FA with no jokers and no commands.
//   2. The joker-signal turnstile — any unexpected signal shuts down to "off".
//   3. The joker-state turnstile — a "service" signal works from any state.
//
// A fourth, command-emitting turnstile FA is introduced in the last section to
// exercise the command loop: the FA emits commands, and FaRunner either
// translates them back into signals (via CommandInterpreter) or consumes the
// next pre-scripted signal from its list.
// ===========================================================================

// ---------------------------------------------------------------------------
// The three tutorial turnstile FAs, kept identical to the tutorial markdown so
// readers can cross-reference. All use lowercase identifiers for consistency
// with the tutorial's runnable code examples.
// ---------------------------------------------------------------------------

/** Basic turnstile — tutorial §2, "Defining the turnstile with the StOP library". */
const turnstileFa: FaDefinition = {
    Turnstile: [
        ["I", "start", "locked"],
        ["locked", "coin", "unlocked"],
        ["unlocked", "push", "locked"]
    ]
};

/** Joker-signal turnstile — tutorial §3.1, "reacting to the unexpected". */
const turnstileWithJokerSignalFa: FaDefinition = {
    Turnstile: [
        ["I", "start", "locked"],
        ["locked", "coin", "unlocked"],
        ["unlocked", "push", "locked"],
        ["locked", "*", "off"],
        ["unlocked", "*", "off"]
    ]
};

/** Joker-state turnstile — tutorial §3.2, "a universal signal for technical personnel". */
const turnstileWithJokerStateFa: FaDefinition = {
    Turnstile: [
        ["I", "start", "locked"],
        ["locked", "coin", "unlocked"],
        ["unlocked", "push", "locked"],
        ["*", "service", "maintenance"]
    ]
};

/**
 * A command-emitting turnstile FA, used to test FaRunner's command loop.
 *
 * Unlike the tutorial FAs above (which use plain triples), this FA uses a
 * quadruple on the "coin" transition: the 4th element ("unlock") is a
 * **command** the FA emits when that transition fires — modelling a turnstile
 * that physically unlocks its arm after accepting a coin.
 *
 * The "push" transition deliberately has NO command (a plain triple). This
 * ensures the command loop terminates cleanly: after "push" brings us back to
 * "locked", there is no command to process, so the runner stops. Without this
 * asymmetry, every transition would emit a command and the runner would need
 * an endless supply of signals.
 */
const turnstileWithCommandsFa: FaDefinition = {
    Turnstile: [
        ["I", "start", "locked"],
        ["locked", "coin", "unlocked", "unlock"],
        ["unlocked", "push", "locked"]
    ]
};

// ===========================================================================
// Section 1: Basic turnstile — feeding a signal list via run()
// ===========================================================================

describe("FaRunner – basic turnstile (no jokers, no commands)", () => {

    it("should drive the FA through start → coin → push and end in 'locked'", () => {
        // Every FA starts in the reserved entry state "I" (see tutorial §2).
        const sfsm = new Sfsm(turnstileFa);
        expect(sfsm.getHeadState()).toBe("I");

        // FaRunner auto-registers its internal command receiver on the Sfsm.
        // Since this FA has no commands, the receiver is never called back.
        const runner = new FaRunner(sfsm, ["start", "coin", "push"]);

        const trace = runner.run();

        // After the full sequence, the turnstile is locked again.
        expect(sfsm.getHeadState()).toBe("locked");

        // The trace records one line per transition: from, signal, to.
        // No commands appear because this FA uses plain triples.
        expect(trace).toBe(
            "I, start, locked\n" +
            "locked, coin, unlocked\n" +
            "unlocked, push, locked"
        );
    });

    it("should produce an empty trace when no signals are provided", () => {
        const sfsm = new Sfsm(turnstileFa);

        const runner = new FaRunner(sfsm, []);
        const trace = runner.run();

        expect(trace).toBe("");
        // The FA never left the entry state.
        expect(sfsm.getHeadState()).toBe("I");
    });
});

// ===========================================================================
// Section 2: Joker-signal turnstile — unexpected signals → "off"
// ===========================================================================

describe("FaRunner – joker-signal turnstile (power failure)", () => {

    it("should reach 'off' when an unexpected signal arrives while locked", () => {
        // The joker-signal transition ["locked", "*", "off"] catches any signal
        // that isn't the explicit "coin" — here "powerFailure".
        const sfsm = new Sfsm(turnstileWithJokerSignalFa);

        const runner = new FaRunner(sfsm, ["start", "powerFailure"]);
        runner.run();

        expect(sfsm.getHeadState()).toBe("off");
    });

    it("should reach 'off' when an unexpected signal arrives while unlocked", () => {
        const sfsm = new Sfsm(turnstileWithJokerSignalFa);

        const runner = new FaRunner(sfsm, ["start", "coin", "sensorGlitch"]);
        runner.run();

        expect(sfsm.getHeadState()).toBe("off");
    });

    it("should still behave normally for known signals (coin, push)", () => {
        const sfsm = new Sfsm(turnstileWithJokerSignalFa);

        const runner = new FaRunner(sfsm, ["start", "coin", "push"]);
        runner.run();

        // Exact transitions always win over the joker, so we end in "locked".
        expect(sfsm.getHeadState()).toBe("locked");
    });
});

// ===========================================================================
// Section 3: Joker-state turnstile — "service" works from any state
// ===========================================================================

describe("FaRunner – joker-state turnstile (maintenance mode)", () => {

    it("should reach 'maintenance' from 'locked' via the service signal", () => {
        // The joker-state transition ["*", "service", "maintenance"] matches
        // "service" regardless of the current state.
        const sfsm = new Sfsm(turnstileWithJokerStateFa);

        const runner = new FaRunner(sfsm, ["start", "service"]);
        runner.run();

        expect(sfsm.getHeadState()).toBe("maintenance");
    });

    it("should reach 'maintenance' from 'unlocked' just as easily", () => {
        const sfsm = new Sfsm(turnstileWithJokerStateFa);

        const runner = new FaRunner(sfsm, ["start", "coin", "service"]);
        runner.run();

        expect(sfsm.getHeadState()).toBe("maintenance");
    });
});

// ===========================================================================
// Section 4: CommandInterpreter — translating commands to signals
// ===========================================================================

describe("CommandInterpreter – command-to-signal mapping", () => {

    it("should return the mapped signal for a known command", () => {
        // The interpreter bridges the FA's internal signal vocabulary and the
        // external command vocabulary. Here "begin" → "start", etc.
        const interpreter = new CommandInterpreter({
            begin: "start",
            insertCoin: "coin",
            pass: "push"
        });

        expect(interpreter.interpretCommand("begin")).toBe("start");
        expect(interpreter.interpretCommand("insertCoin")).toBe("coin");
        expect(interpreter.interpretCommand("pass")).toBe("push");
    });

    it("should throw for an unknown command", () => {
        const interpreter = new CommandInterpreter({ begin: "start" });

        // An unmapped command is almost certainly a bug, so we fail loudly.
        expect(() => interpreter.interpretCommand("unknown")).toThrow(
            'no signal mapping for command "unknown"'
        );
    });

    it("should not be affected by later mutations of the original record", () => {
        const map: Record<string, string> = { begin: "start" };
        const interpreter = new CommandInterpreter(map);

        // Mutate the caller's object after construction.
        map.begin = "somethingElse";

        // The interpreter keeps its own defensive copy, so it is unaffected.
        expect(interpreter.interpretCommand("begin")).toBe("start");
    });
});

// ===========================================================================
// Section 5: FaRunner with a command-emitting FA — the command loop
//
// This is where FaRunner's internal ICommandReceiver comes into play. The FA
// below emits "unlock" / "lock" commands on its transitions. Because FaRunner
// registered a command receiver on the Sfsm in its constructor, those commands
// flow back into the runner's handleCommand, which either:
//   (a) translates the command into a signal via CommandInterpreter, or
//   (b) consumes the next signal from the pre-scripted list.
// ===========================================================================

describe("FaRunner – command loop with a command-emitting turnstile", () => {

    // -------------------------------------------------------------------------
    // (a) No interpreter: commands consume the next signal from the list.
    //
    // The FA emits "unlock" after receiving "coin". With no interpreter, the
    // runner treats this command as a "tick" and pulls the next signal
    // ("push") from the list. The "push" transition has no command, so the
    // loop terminates cleanly.
    // -------------------------------------------------------------------------

    it("without interpreter: commands consume the next signal from the list", () => {
        const sfsm = new Sfsm(turnstileWithCommandsFa);

        // The list contains all three signals. "coin" is sent by run(), but
        // "push" is consumed by the "unlock" command's handler, not by run().
        const runner = new FaRunner(sfsm, ["start", "coin", "push"]);
        const trace = runner.run();

        expect(sfsm.getHeadState()).toBe("locked");

        // The trace shows all three transitions. The second transition carries
        // the "unlock" command; the third ("push") has no command, so the loop
        // terminates cleanly after returning to "locked".
        expect(trace).toBe(
            "I, start, locked\n" +
            "locked, coin, unlocked, unlock\n" +
            "unlocked, push, locked"
        );
    });

    it("without interpreter: should throw when a command arrives but the list is exhausted", () => {
        const sfsm = new Sfsm(turnstileWithCommandsFa);

        // Only "start" and "coin" are provided. The "unlock" command emitted
        // by the "coin" transition tries to consume the next signal, but the
        // list is already empty → error.
        const runner = new FaRunner(sfsm, ["start", "coin"]);

        expect(() => runner.run()).toThrow("signal list is exhausted");
    });

    // -------------------------------------------------------------------------
    // (b) With interpreter: commands are translated into signals.
    //
    // The FA emits "unlock" after "coin". The interpreter maps "unlock" back
    // to "push", which is sent into the FA. The "push" transition returns us
    // to "locked" with no further command, so the loop terminates naturally.
    // -------------------------------------------------------------------------

    it("with interpreter: the FA self-drives via command→signal translation", () => {
        const sfsm = new Sfsm(turnstileWithCommandsFa);

        // Only "start" and "coin" are needed — the "push" signal is generated
        // by the interpreter translating the "unlock" command.
        const runner = new FaRunner(sfsm, ["start", "coin"]);
        runner.setCommandInterpreter(new CommandInterpreter({
            unlock: "push"
        }));

        const trace = runner.run();

        expect(sfsm.getHeadState()).toBe("locked");

        // The trace is identical to the no-interpreter case, but "push" was
        // produced by the interpreter, not pulled from the signal list.
        expect(trace).toBe(
            "I, start, locked\n" +
            "locked, coin, unlocked, unlock\n" +
            "unlocked, push, locked"
        );
    });

    it("with interpreter: should throw for an unmapped command", () => {
        const sfsm = new Sfsm(turnstileWithCommandsFa);

        // The interpreter maps nothing — the "unlock" command is unmapped.
        const runner = new FaRunner(sfsm, ["start", "coin"]);
        runner.setCommandInterpreter(new CommandInterpreter({}));

        // "coin" → "unlock" → interpreter throws for "unlock".
        expect(() => runner.run()).toThrow('no signal mapping for command "unlock"');
    });
});