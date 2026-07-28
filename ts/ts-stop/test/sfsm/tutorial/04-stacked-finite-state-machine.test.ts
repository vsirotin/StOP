import { Sfsm, FaDefinition } from "../../../src/sfsm";

// ---------------------------------------------------------------------------
// The standalone banknote-payment FA from docs/Tutorial/Tutorial.md,
// "4. What is a Stacked Finite State Machine (SFSM)?".
// This is a single, self-contained FA (no sub-FAs of its own) — a minimal
// illustration of the compact format before hierarchies are introduced.
// ---------------------------------------------------------------------------

const banknotePaymentFa: FaDefinition = {
    BPP: [
        ["I", "BR.bc", "checking", "BC.check"],
        ["checking", "BC.pass", "accepting", "BA.accept"],
        ["checking", "BC.reject", "E_rejected"],
        ["accepting", "BA.changeNeeded", "E_changeNeeded"],
        ["accepting", "BA.noChangeNeeded", "E_noChangeNeeded"]
    ]
};

function buildSfsm(): Sfsm {
    const sfsm = new Sfsm();
    sfsm.loadFA(banknotePaymentFa);
    return sfsm;
}

describe("Tutorial – What is a Stacked Finite State Machine (banknote payment)", () => {
    it("should start in the reserved state 'I'", () => {
        const sfsm = buildSfsm();
        expect(sfsm.getHeadState()).toBe("I");
    });

    it("should move to 'checking' when a banknote candidate arrives", () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal("BR.bc");
        expect(sfsm.getHeadState()).toBe("checking");
    });

    it("should reach the 'accepting' state after the checker passes the banknote", () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal("BR.bc");
        sfsm.receiveSignal("BC.pass");
        expect(sfsm.getHeadState()).toBe("accepting");
    });

    it("should reset to 'I' after an exit state is reached (rejected banknote)", () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal("BR.bc");
        sfsm.receiveSignal("BC.reject");
        // BPP is the (only) root FA here, so reaching an exit state resets it to I
        expect(sfsm.getHeadState()).toBe("I");
    });

    it("should reset to 'I' after an exit state is reached (accepted, change needed)", () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal("BR.bc");
        sfsm.receiveSignal("BC.pass");
        sfsm.receiveSignal("BA.changeNeeded");
        expect(sfsm.getHeadState()).toBe("I");
    });
});
