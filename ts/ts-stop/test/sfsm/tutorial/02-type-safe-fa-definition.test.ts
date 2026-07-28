import { Sfsm, FaDefinition, Transition } from "../../../src/sfsm";

// ---------------------------------------------------------------------------
// The type-safe turnstile FA from docs/Tutorial/Tutorial.md, "2.1 A type-safe
// alternative". Kept identical to the tutorial so readers can copy-paste-verify.
// ---------------------------------------------------------------------------

type TurnstileState = "I" | "locked" | "unlocked";
type TurnstileSignal = "start" | "coin" | "push";

// A transition restricted to a specific pair of state/signal literal types.
type TypedTransition<S extends string, G extends string> = [S, G, S];

// Accepts only transitions built from S/G, returns the plain runtime Transition[]
// that Sfsm actually consumes — no change to the library"s runtime format.
function typedTransitions<S extends string, G extends string>(
    transitions: Array<TypedTransition<S, G>>
): Transition[] {
    return transitions;
}

const turnstileTransitions = typedTransitions<TurnstileState, TurnstileSignal>([
    ["I", "start", "locked"],
    ["locked", "coin", "unlocked"],
    ["unlocked", "push", "locked"],
]);

const turnstileFa: FaDefinition = { Turnstile: turnstileTransitions };

function buildSfsm(): Sfsm {
    const sfsm = new Sfsm();
    sfsm.loadFA(turnstileFa);
    return sfsm;
}

describe("Tutorial – A type-safe alternative (turnstile)", () => {
    it("should start in the reserved state 'I' before the start signal", () => {
        const sfsm = buildSfsm();
        expect(sfsm.getHeadState()).toBe("I");
    });

    it("should move to 'locked' after the start signal", () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal("start");
        expect(sfsm.getHeadState()).toBe("locked");
    });

    it("should unlock after a coin signal", () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal("start");
        sfsm.receiveSignal("coin");
        expect(sfsm.getHeadState()).toBe("unlocked");
    });

    it("should lock again after a push signal", () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal("start");
        sfsm.receiveSignal("coin");
        sfsm.receiveSignal("push");
        expect(sfsm.getHeadState()).toBe("locked");
    });
});
