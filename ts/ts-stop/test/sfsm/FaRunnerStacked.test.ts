import { Sfsm, FaDefinition } from "../../src/sfsm";
import { FaRunner } from "../../src/sfsm/tools/runner/FaRunner";
import { CommandInterpreter } from "../../src/sfsm/tools/runner/CommandInterpreter";

// ===========================================================================
// FaRunner + CommandInterpreter — stacked FA unit tests
//
// This test file demonstrates how FaRunner drives a **Stacked Finite State
// Machine (SFSM)** — a root FA that contains a sub-FA as one of its states.
// This is the concept introduced in tutorial chapter 2 ("02-stacked-finite-
// state-machine.md").
//
// The example extends the command-emitting turnstile from FaRunner.test.ts
// with a "CheckCoin" sub-FA. Instead of unlocking immediately when a coin is
// inserted, the turnstile now delegates the coin verification to a dedicated
// child FA that checks the coin's weight and form in two separate steps. Only
// when both checks pass does the child FA exit with "E_OK", forwarding the
// "coin-ok" signal back to the parent Turnstile, which then unlocks.
//
// ## How stacking works in the Sfsm engine
//
// 1. The root FA (Turnstile) has a transition whose target state name matches
//    a key in the FaDefinition — that target is a **sub-FA**, not a leaf state.
// 2. When such a transition fires, the engine **pushes** the sub-FA onto an
//    internal stack and **forwards** the triggering signal to it.
// 3. The sub-FA runs independently, processing signals until it reaches an
//    **exit state** (a state whose name starts with "E_").
// 4. On reaching an exit state, the engine **pops** the sub-FA and **forwards
//    the triggering signal** to the parent FA, which is now the new head.
// 5. The parent FA has a transition from the sub-FA's name (as a state) for
//    that forwarded signal — this is how the parent reacts to the child's
//    completion.
//
// ## The FA used here
//
// Turnstile (root):
//   - "start" takes it from "I" to "locked".
//   - "coin" takes it from "locked" to "CheckCoin" (a sub-FA — pushed onto stack).
//   - "coin-ok" (forwarded from CheckCoin's exit) takes it from "CheckCoin" to
//     "unlocked" and emits the "unlock" command.
//   - "weight-bad" / "form-bad" (forwarded from CheckCoin's rejection exits)
//     take it from "CheckCoin" back to "locked" (coin rejected).
//   - "push" takes it from "unlocked" to "locked".
//
// CheckCoin (sub-FA):
//   - "coin" (forwarded from parent) takes it from "I" to "checking-weight" and
//     emits "check-weight".
//   - "weight-ok" takes it to "checking-form" and emits "check-form".
//   - "coin-ok" takes it to "E_OK" (exit → pop, forward "coin-ok" to parent).
//   - "weight-bad" takes it to "E_Rejected" (exit → pop, forward to parent).
//   - "form-bad" takes it to "E_Rejected" (exit → pop, forward to parent).
// ===========================================================================

/**
 * The stacked turnstile FA: a root "Turnstile" with a "CheckCoin" sub-FA.
 *
 * In compact multi-FA format, each top-level key is an FA name. The Sfsm
 * engine detects that "CheckCoin" is a sub-FA because it appears as a target
 * state in Turnstile's transitions AND is itself a key in the definition.
 */
const turnstileWithCheckCoinFa: FaDefinition = {
    Turnstile: [
        ["I", "start", "locked"],
        // "coin" pushes the CheckCoin sub-FA onto the stack; the signal is
        // forwarded into it.
        ["locked", "coin", "CheckCoin"],
        // When CheckCoin exits with E_OK, "coin-ok" is forwarded here → unlock.
        ["CheckCoin", "coin-ok", "unlocked", "unlock"],
        // When CheckCoin exits with E_Rejected (weight or form bad), the
        // triggering signal is forwarded here → stay locked.
        ["CheckCoin", "weight-bad", "locked"],
        ["CheckCoin", "form-bad", "locked"],
        ["unlocked", "push", "locked"]
    ],
    CheckCoin: [
        // Entry: the forwarded "coin" signal starts the weight check.
        ["I", "coin", "checking-weight", "check-weight"],
        // Weight OK → check the form next.
        ["checking-weight", "weight-ok", "checking-form", "check-form"],
        // Form OK → exit with E_OK. The "coin-ok" signal is forwarded to the
        // parent Turnstile, which unlocks.
        ["checking-form", "coin-ok", "E_OK"],
        // Weight bad → exit with E_Rejected. "weight-bad" is forwarded.
        ["checking-weight", "weight-bad", "E_Rejected"],
        // Form bad → exit with E_Rejected. "form-bad" is forwarded.
        ["checking-form", "form-bad", "E_Rejected"]
    ]
};

// ===========================================================================
// Section 1: Happy path — both checks pass, turnstile unlocks
// ===========================================================================

describe("FaRunner – stacked turnstile: happy path (coin accepted)", () => {

    // -------------------------------------------------------------------------
    // (a) Without interpreter: all signals provided explicitly in the list.
    //
    // The signal list must include not only the top-level signals ("start",
    // "coin") but also the sub-FA signals ("weight-ok", "coin-ok") and the
    // final "push". The commands emitted by the FA ("check-weight",
    // "check-form", "unlock") act as "ticks" that pull the next signal from
    // the list.
    // -------------------------------------------------------------------------

    it("without interpreter: should unlock after weight + form checks pass", () => {
        const sfsm = new Sfsm();
        sfsm.loadFA(turnstileWithCheckCoinFa);

        // The full signal sequence:
        //   "start"      → sent by run()
        //   "coin"       → sent by run(); pushes CheckCoin, forwarded into it
        //   "weight-ok"  → consumed by "check-weight" command
        //   "coin-ok"    → consumed by "check-form" command; exits CheckCoin,
        //                  forwarded to Turnstile → unlock
        //   "push"       → consumed by "unlock" command; locks again
        const runner = new FaRunner(sfsm, [
            "start", "coin", "weight-ok", "coin-ok", "push"
        ]);

        const trace = runner.run();

        // After the full cycle, the turnstile is locked again.
        expect(sfsm.getHeadState()).toBe("locked");

        // The trace shows every transition across both FAs:
        //   - Turnstile transitions use Turnstile's state names.
        //   - CheckCoin transitions use CheckCoin's state names (including "I").
        //   - The sub-FA push produces two log entries: one for the parent
        //     transition (locked → CheckCoin) and one for the forwarded signal
        //     in the child (I → checking-weight).
        //   - The exit produces two log entries: one for the child reaching
        //     E_OK, and one for the forwarded signal in the parent
        //     (CheckCoin → unlocked).
        expect(trace).toBe(
            "I, start, locked\n" +
            "locked, coin, CheckCoin\n" +
            "I, coin, checking-weight, check-weight\n" +
            "checking-weight, weight-ok, checking-form, check-form\n" +
            "checking-form, coin-ok, E_OK\n" +
            "CheckCoin, coin-ok, unlocked, unlock\n" +
            "unlocked, push, locked"
        );
    });

    // -------------------------------------------------------------------------
    // (b) With interpreter: the FA self-drives via command→signal translation.
    //
    // Only "start" and "coin" are needed in the signal list. Every command
    // emitted by the FA is translated back into a signal by the interpreter,
    // closing the loop:
    //   "check-weight" → "weight-ok"  (weight check done, passed)
    //   "check-form"   → "coin-ok"    (form check done, coin is OK)
    //   "unlock"       → "push"       (person passes through)
    // -------------------------------------------------------------------------

    it("with interpreter: the stacked FA self-drives to locked", () => {
        const sfsm = new Sfsm();
        sfsm.loadFA(turnstileWithCheckCoinFa);

        const runner = new FaRunner(sfsm, ["start", "coin"]);
        runner.setCommandInterpreter(new CommandInterpreter({
            "check-weight": "weight-ok",
            "check-form": "coin-ok",
            "unlock": "push"
        }));

        const trace = runner.run();

        expect(sfsm.getHeadState()).toBe("locked");

        // The trace is identical to the no-interpreter case — the same signals
        // are sent, just generated by the interpreter instead of pulled from
        // the list.
        expect(trace).toBe(
            "I, start, locked\n" +
            "locked, coin, CheckCoin\n" +
            "I, coin, checking-weight, check-weight\n" +
            "checking-weight, weight-ok, checking-form, check-form\n" +
            "checking-form, coin-ok, E_OK\n" +
            "CheckCoin, coin-ok, unlocked, unlock\n" +
            "unlocked, push, locked"
        );
    });

    it("should pass through 'unlocked' after the coin is accepted", () => {
        // This test verifies the intermediate state: after CheckCoin exits
        // with E_OK and "coin-ok" is forwarded, the Turnstile is in
        // "unlocked" — before the "push" signal locks it again.
        //
        // We provide only the signals up to "coin-ok". The "unlock" command
        // emitted by the Turnstile's "coin-ok" transition then tries to
        // consume the next signal, but the list is exhausted → error.
        // Importantly, the Sfsm updates the state to "unlocked" BEFORE
        // dispatching the command, so the head state is already "unlocked"
        // when the error is thrown.
        const sfsm = new Sfsm();
        sfsm.loadFA(turnstileWithCheckCoinFa);

        const runner = new FaRunner(sfsm, ["start", "coin", "weight-ok", "coin-ok"]);

        // run() throws because the "unlock" command finds no next signal.
        expect(() => runner.run()).toThrow("signal list is exhausted");

        // Despite the error, the FA has already reached "unlocked".
        expect(sfsm.getHeadState()).toBe("unlocked");
    });
});

// ===========================================================================
// Section 2: Rejection paths — a check fails, coin is rejected
// ===========================================================================

describe("FaRunner – stacked turnstile: rejection paths", () => {

    it("should reject the coin and stay locked when the weight check fails", () => {
        const sfsm = new Sfsm();
        sfsm.loadFA(turnstileWithCheckCoinFa);

        // "weight-bad" is consumed by the "check-weight" command. CheckCoin
        // transitions to E_Rejected, pops, and "weight-bad" is forwarded to
        // Turnstile, which goes back to "locked".
        const runner = new FaRunner(sfsm, ["start", "coin", "weight-bad"]);
        const trace = runner.run();

        expect(sfsm.getHeadState()).toBe("locked");

        // The trace shows CheckCoin reaching E_Rejected, then the forwarded
        // "weight-bad" signal returning Turnstile to "locked".
        expect(trace).toBe(
            "I, start, locked\n" +
            "locked, coin, CheckCoin\n" +
            "I, coin, checking-weight, check-weight\n" +
            "checking-weight, weight-bad, E_Rejected\n" +
            "CheckCoin, weight-bad, locked"
        );
    });

    it("should reject the coin and stay locked when the form check fails", () => {
        const sfsm = new Sfsm();
        sfsm.loadFA(turnstileWithCheckCoinFa);

        // Weight passes, but form fails. "form-bad" is consumed by the
        // "check-form" command. CheckCoin exits with E_Rejected, "form-bad"
        // is forwarded to Turnstile → "locked".
        const runner = new FaRunner(sfsm, [
            "start", "coin", "weight-ok", "form-bad"
        ]);
        const trace = runner.run();

        expect(sfsm.getHeadState()).toBe("locked");

        expect(trace).toBe(
            "I, start, locked\n" +
            "locked, coin, CheckCoin\n" +
            "I, coin, checking-weight, check-weight\n" +
            "checking-weight, weight-ok, checking-form, check-form\n" +
            "checking-form, form-bad, E_Rejected\n" +
            "CheckCoin, form-bad, locked"
        );
    });
});

// ===========================================================================
// Section 3: Stack inspection — verifying the SFSM stack during execution
// ===========================================================================

describe("FaRunner – stacked turnstile: stack inspection", () => {

    it("should show [Turnstile] before and after the sub-FA runs", () => {
        // Before any signal, the stack is just the root FA.
        const sfsm = new Sfsm();
        sfsm.loadFA(turnstileWithCheckCoinFa);
        expect(sfsm.getCurrentStack()).toEqual(["Turnstile"]);

        // After "start", still just the root.
        sfsm.receiveSignal("start");
        expect(sfsm.getCurrentStack()).toEqual(["Turnstile"]);
        expect(sfsm.getHeadState()).toBe("locked");

        // After "coin", CheckCoin is pushed onto the stack.
        sfsm.receiveSignal("coin");
        expect(sfsm.getCurrentStack()).toEqual(["Turnstile", "CheckCoin"]);
        expect(sfsm.getHeadState()).toBe("checking-weight");

        // After "weight-ok", still inside CheckCoin.
        sfsm.receiveSignal("weight-ok");
        expect(sfsm.getCurrentStack()).toEqual(["Turnstile", "CheckCoin"]);
        expect(sfsm.getHeadState()).toBe("checking-form");

        // After "coin-ok", CheckCoin exits (E_OK → pop) and control returns
        // to Turnstile, which transitions to "unlocked".
        sfsm.receiveSignal("coin-ok");
        expect(sfsm.getCurrentStack()).toEqual(["Turnstile"]);
        expect(sfsm.getHeadState()).toBe("unlocked");
    });
});