import { Sfsm, FaDefinition } from "../../../src/sfsm";

// ---------------------------------------------------------------------------
// The stacked turnstile FA from the tutorial, "4.1 Extending the turnstile
// with a CheckCoin sub-FA".
//
// This is the same FA used in FaRunnerStacked.test.ts, kept identical to the
// tutorial markdown so readers can copy-paste-verify. The root Turnstile FA
// delegates coin verification to a CheckCoin sub-FA that checks weight and
// form in two steps before exiting with E_OK (accepted) or E_Rejected
// (rejected).
// ---------------------------------------------------------------------------

const turnstileWithCheckCoinFa: FaDefinition = {
    Turnstile: [
        ["I", "start", "locked"],
        ["locked", "coin", "CheckCoin"],
        ["CheckCoin", "coin-ok", "unlocked", "unlock"],
        ["CheckCoin", "weight-bad", "locked"],
        ["CheckCoin", "form-bad", "locked"],
        ["unlocked", "push", "locked"]
    ],
    CheckCoin: [
        ["I", "coin", "checking-weight", "check-weight"],
        ["checking-weight", "weight-ok", "checking-form", "check-form"],
        ["checking-form", "coin-ok", "E_OK"],
        ["checking-weight", "weight-bad", "E_Rejected"],
        ["checking-form", "form-bad", "E_Rejected"]
    ]
};

describe("Tutorial – Stacked Finite State Machine (turnstile with CheckCoin)", () => {

    // ── Entry state and stack ──────────────────────────────────────────────

    it("should start in the reserved state 'I' with only Turnstile on the stack", () => {
        const sfsm = new Sfsm(turnstileWithCheckCoinFa);
        expect(sfsm.getHeadState()).toBe("I");
        expect(sfsm.getCurrentStack()).toEqual(["Turnstile"]);
    });

    it("should move to 'locked' after the start signal", () => {
        const sfsm = new Sfsm(turnstileWithCheckCoinFa);
        sfsm.receiveSignal("start");
        expect(sfsm.getHeadState()).toBe("locked");
        expect(sfsm.getCurrentStack()).toEqual(["Turnstile"]);
    });

    // ── Sub-FA push ────────────────────────────────────────────────────────

    it("should push CheckCoin onto the stack when 'coin' is received while locked", () => {
        const sfsm = new Sfsm(turnstileWithCheckCoinFa);
        sfsm.receiveSignal("start");
        sfsm.receiveSignal("coin");
        // CheckCoin is pushed; the 'coin' signal is forwarded into it,
        // driving it from 'I' to 'checking-weight'.
        expect(sfsm.getCurrentStack()).toEqual(["Turnstile", "CheckCoin"]);
        expect(sfsm.getHeadState()).toBe("checking-weight");
    });

    it("should advance to 'checking-form' after the weight check passes", () => {
        const sfsm = new Sfsm(turnstileWithCheckCoinFa);
        sfsm.receiveSignal("start");
        sfsm.receiveSignal("coin");
        sfsm.receiveSignal("weight-ok");
        expect(sfsm.getHeadState()).toBe("checking-form");
        expect(sfsm.getCurrentStack()).toEqual(["Turnstile", "CheckCoin"]);
    });

    // ── Sub-FA pop on success (E_OK) ───────────────────────────────────────

    it("should pop CheckCoin and unlock when both checks pass (E_OK → coin-ok forwarded)", () => {
        const sfsm = new Sfsm(turnstileWithCheckCoinFa);
        sfsm.receiveSignal("start");
        sfsm.receiveSignal("coin");
        sfsm.receiveSignal("weight-ok");
        sfsm.receiveSignal("coin-ok");
        // CheckCoin reached E_OK → popped, 'coin-ok' forwarded to Turnstile
        // → transition to 'unlocked' with 'unlock' command.
        expect(sfsm.getCurrentStack()).toEqual(["Turnstile"]);
        expect(sfsm.getHeadState()).toBe("unlocked");
    });

    it("should lock again after a push signal following a successful coin check", () => {
        const sfsm = new Sfsm(turnstileWithCheckCoinFa);
        sfsm.receiveSignal("start");
        sfsm.receiveSignal("coin");
        sfsm.receiveSignal("weight-ok");
        sfsm.receiveSignal("coin-ok");
        sfsm.receiveSignal("push");
        expect(sfsm.getHeadState()).toBe("locked");
    });

    // ── Sub-FA pop on rejection (E_Rejected) ───────────────────────────────

    it("should pop CheckCoin and stay locked when the weight check fails", () => {
        const sfsm = new Sfsm(turnstileWithCheckCoinFa);
        sfsm.receiveSignal("start");
        sfsm.receiveSignal("coin");
        sfsm.receiveSignal("weight-bad");
        // CheckCoin reached E_Rejected → popped, 'weight-bad' forwarded to
        // Turnstile → transition back to 'locked'.
        expect(sfsm.getCurrentStack()).toEqual(["Turnstile"]);
        expect(sfsm.getHeadState()).toBe("locked");
    });

    it("should pop CheckCoin and stay locked when the form check fails", () => {
        const sfsm = new Sfsm(turnstileWithCheckCoinFa);
        sfsm.receiveSignal("start");
        sfsm.receiveSignal("coin");
        sfsm.receiveSignal("weight-ok");
        sfsm.receiveSignal("form-bad");
        // CheckCoin reached E_Rejected → popped, 'form-bad' forwarded to
        // Turnstile → transition back to 'locked'.
        expect(sfsm.getCurrentStack()).toEqual(["Turnstile"]);
        expect(sfsm.getHeadState()).toBe("locked");
    });
});