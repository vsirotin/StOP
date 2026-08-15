import { Sfsm, FaDefinition } from "../../../src/sfsm";

// ---------------------------------------------------------------------------
// The turnstile FA from docs/Tutorial/Tutorial.md, "What is a Finite Automaton?"
// Kept identical to the JSON shown in the tutorial so readers can copy-paste-verify.
// ---------------------------------------------------------------------------

const turnstileFa: FaDefinition = {
    Turnstile: [
        ["I", "start", "locked"],
        ["locked", "coin", "unlocked"],
        ["unlocked", "push", "locked"]
    ]
};


describe("Tutorial – What is a Finite Automaton (turnstile)", () => {
    it("should start in the reserved state 'I' before the start signal", () => {
        const sfsm = new Sfsm(turnstileFa);;
        expect(sfsm.getHeadState()).toBe("I");
    });

    it("should move to 'locked' after the start signal", () => {
        const sfsm = new Sfsm(turnstileFa);;
        sfsm.receiveSignal("start");
        expect(sfsm.getHeadState()).toBe("locked");
    });

    it("should unlock after a coin signal", () => {
        const sfsm = new Sfsm(turnstileFa);;
        sfsm.receiveSignal("start");
        sfsm.receiveSignal("coin");
        expect(sfsm.getHeadState()).toBe("unlocked");
    });

    it("should lock again after a push signal", () => {
        const sfsm = new Sfsm(turnstileFa);;
        sfsm.receiveSignal("start");
        sfsm.receiveSignal("coin");
        sfsm.receiveSignal("push");
        expect(sfsm.getHeadState()).toBe("locked");
    });

    it("should throw on an unknown signal in a given state (default policy)", () => {
        const sfsm = new Sfsm(turnstileFa);;
        sfsm.receiveSignal("start");
        expect(() => sfsm.receiveSignal("push")).toThrow();
    });
});
