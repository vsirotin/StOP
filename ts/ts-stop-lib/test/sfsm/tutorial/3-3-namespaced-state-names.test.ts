import { Sfsm, FaDefinition } from "../../../src/sfsm";

// ---------------------------------------------------------------------------
// The namespaced turnstile + coin-check FA from docs/Tutorial/Tutorial.md,
// "8.1 Name conventions". Every state name is prefixed with its own FA"s
// name using a dot ("TS.I", "TS.L", ...), and exit states use the ".E_"
// form ("CC.E_ok") instead of the bare "E_ok" seen elsewhere in this
// tutorial — demonstrating that the Sfsm engine auto-detects both the
// entry state ("I" or "*.I") and exit states ("E_..." or "*.E_...") per FA,
// with no new SfsmOptions and no change to matching/push/pop behaviour.
// ---------------------------------------------------------------------------

const namespacedTurnstileFa: FaDefinition = {
    TS: [
        ["TS.I", "TS>start", "TS.L"],
        ["TS.L", "TS>coin", "CC"],
        ["CC", "CC>ok", "TS.U"],
        ["CC", "CC>bad", "TS.L"],
        ["TS.U", "TS>push", "TS.L"]
    ],
    CC: [
        ["CC.I", "TS>coin", "CC.checking"],
        ["CC.checking", "CC>ok", "CC.E_ok"],
        ["CC.checking", "CC>bad", "CC.E_bad"]
    ]
};


describe("Tutorial – Name conventions (namespaced entry/exit state names)", () => {
    it("should auto-detect the namespaced entry state 'TS.I' for the root FA", () => {
        const sfsm = new Sfsm(namespacedTurnstileFa);
        expect(sfsm.getCurrentStack()).toEqual(["TS"]);
        expect(sfsm.getHeadState()).toBe("TS.I");
    });

    it("should move to 'TS.L' on the start signal", () => {
        const sfsm = new Sfsm(namespacedTurnstileFa);
        sfsm.receiveSignal("TS>start");
        expect(sfsm.getHeadState()).toBe("TS.L");
    });

    it("should push CC on a coin and auto-detect its namespaced entry state 'CC.I'", () => {
        const sfsm = new Sfsm(namespacedTurnstileFa);
        sfsm.receiveSignal("TS>start");
        sfsm.receiveSignal("TS>coin");
        // CC.I"s own transition is triggered directly by the forwarded "TS>coin"
        // signal, so CC lands straight on "CC.checking" instead of staying on "CC.I".
        expect(sfsm.getCurrentStack()).toEqual(["TS", "CC"]);
        expect(sfsm.getHeadState()).toBe("CC.checking");
    });

    it("should recognise 'CC.E_ok' as an exit ('.E_' form), pop CC, and unlock", () => {
        const sfsm = new Sfsm(namespacedTurnstileFa);
        sfsm.receiveSignal("TS>start");
        sfsm.receiveSignal("TS>coin");
        sfsm.receiveSignal("CC>ok");
        expect(sfsm.getCurrentStack()).toEqual(["TS"]);
        expect(sfsm.getHeadState()).toBe("TS.U");

        sfsm.receiveSignal("TS>push");
        expect(sfsm.getHeadState()).toBe("TS.L");
    });

    it("should recognise 'CC.E_bad' as an exit, pop CC, and stay locked", () => {
        const sfsm = new Sfsm(namespacedTurnstileFa);
        sfsm.receiveSignal("TS>start");
        sfsm.receiveSignal("TS>coin");
        sfsm.receiveSignal("CC>bad");
        expect(sfsm.getCurrentStack()).toEqual(["TS"]);
        expect(sfsm.getHeadState()).toBe("TS.L");
    });
});
