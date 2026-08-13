import { Sfsm, FaDefinition, SignalSender, ICommandReceiver, ControllerHub } from "../../../src/sfsm";

// ---------------------------------------------------------------------------
// The TurnstileGate "Transceiver" from docs/Tutorial/Tutorial.md,
// "6. Signal Senders, Command Receivers, Controllers, and the Transceiver Hub".
//
// TurnstileGate plays BOTH roles at once, as most real devices do:
// - SignalSender: it emits "start" / "coin" / "push" into the SFSM.
// - ICommandReceiver: it receives "GATE.lock" / "GATE.unlock" commands from the SFSM.
// ---------------------------------------------------------------------------

class TurnstileGate extends SignalSender implements ICommandReceiver {
    private locked = true;

    getSignalNames(): readonly string[] {
        return ["start", "coin", "push"];
    }

    getCommandNames(): readonly string[] {
        return ["GATE.lock", "GATE.unlock"];
    }

    receiveCommand(command: string): void {
        this.locked = command === "GATE.lock";
    }

    isLocked(): boolean {
        return this.locked;
    }

    start(): void {
        this.sendSignal("start");
    }

    insertCoin(): void {
        this.sendSignal("coin");
    }

    walkThrough(): void {
        this.sendSignal("push");
    }
}

const turnstileFa: FaDefinition = {
    Turnstile: [
        ["I", "start", "locked"],
        ["locked", "coin", "unlocked", "GATE.unlock"],
        ["unlocked", "push", "locked", "GATE.lock"]
    ]
};

function buildWiredGate(): { sfsm: Sfsm; gate: TurnstileGate } {
    const sfsm = new Sfsm();
    const gate = new TurnstileGate();

    new ControllerHub()
        .registerSignalSender(gate)
        .registerCommandReceiver(gate)
        .connectTo(sfsm);

    sfsm.loadFA(turnstileFa);
    return { sfsm, gate };
}

describe("Tutorial – Controllers and the Transceiver Hub (turnstile gate)", () => {
    it("should start locked", () => {
        const { gate } = buildWiredGate();
        expect(gate.isLocked()).toBe(true);
    });

    it("should unlock the physical gate when a coin is inserted", () => {
        const { sfsm, gate } = buildWiredGate();
        gate.start();
        gate.insertCoin();

        expect(sfsm.getHeadState()).toBe("unlocked");
        expect(gate.isLocked()).toBe(false);
    });

    it("should lock the physical gate again after someone walks through", () => {
        const { sfsm, gate } = buildWiredGate();
        gate.start();
        gate.insertCoin();
        gate.walkThrough();

        expect(sfsm.getHeadState()).toBe("locked");
        expect(gate.isLocked()).toBe(true);
    });

    it("should expose the wired signal and command names for diagnostics", () => {
        const sfsm = new Sfsm();
        const gate = new TurnstileGate();
        const hub = new ControllerHub()
            .registerSignalSender(gate)
            .registerCommandReceiver(gate)
            .connectTo(sfsm);

        expect(hub.getRegisteredSignals().sort()).toEqual(["coin", "push", "start"]);
        expect(hub.getRegisteredCommands().sort()).toEqual(["GATE.lock", "GATE.unlock"]);
    });
});
