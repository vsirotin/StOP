import { Sfsm, FaDefinition } from "../../../src/sfsm";

// ---------------------------------------------------------------------------
// The joker-signal turnstile FA from docs/Tutorial/Tutorial.md,
// "3.1 Joker signal: reacting to the unexpected (e.g. a power failure)".
// Kept identical to the tutorial so readers can copy-paste-verify.
// ---------------------------------------------------------------------------

const turnstileWithJokerSignalFa: FaDefinition = {
    Turnstile: [
        ["I", "start", "locked"],
        ["locked", "coin", "unlocked"],
        ["unlocked", "push", "locked"],
        ["locked", "*", "off"],
        ["unlocked", "*", "off"]
    ]
};

function buildSfsm(): Sfsm {
    const sfsm = new Sfsm();
    sfsm.loadFA(turnstileWithJokerSignalFa);
    return sfsm;
}

describe("Tutorial – Joker signal (turnstile power failure)", () => {
    it("should behave exactly as the plain turnstile for known signals", () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal("start");
        expect(sfsm.getHeadState()).toBe("locked");

        sfsm.receiveSignal("coin");
        expect(sfsm.getHeadState()).toBe("unlocked");

        sfsm.receiveSignal("push");
        expect(sfsm.getHeadState()).toBe("locked");
    });

    it("should fall back to 'off' when an unexpected signal arrives while locked", () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal("start");
        sfsm.receiveSignal("powerFailure");
        expect(sfsm.getHeadState()).toBe("off");
    });

    it("should fall back to 'off' when an unexpected signal arrives while unlocked", () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal("start");
        sfsm.receiveSignal("coin");
        sfsm.receiveSignal("sensorGlitch");
        expect(sfsm.getHeadState()).toBe("off");
    });
});
