import * as path from "path";
import * as fs from "fs";
import { Sfsm, FaDefinition, ControllerHub, CommandReceiver } from "../../src/sfsm";
import { TurnstileService } from "./simulators/TurnstileService";
import { TurnstileDevice } from "./simulators/TurnstileDevice";
import { CoinChecker } from "./simulators/CoinChecker";
import { CoinAcceptor } from "./simulators/CoinAcceptor";
import { Changer } from "./simulators/Changer";
import { BanknoteChecker } from "./simulators/BanknoteChecker";
import { BanknoteAcceptor } from "./simulators/BanknoteAcceptor";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadCompactTurnstileFa(): FaDefinition {
    const p = path.resolve(__dirname, "test-data/turnstile-fa-compact.json");
    return JSON.parse(fs.readFileSync(p, "utf-8")) as FaDefinition;
}

/** Test-only CommandReceiver that swallows every command it is registered for. */
class AbsorbingCommandReceiver extends CommandReceiver {
    constructor(private readonly commands: string[]) { super(); }
    getCommandNames(): readonly string[] { return this.commands; }
    receiveCommand(): void { /* absorb */ }
}

interface Harness {
    sfsm: Sfsm;
    service: TurnstileService;
    device: TurnstileDevice;
    coinChecker: CoinChecker;
    coinAcceptor: CoinAcceptor;
    changer: Changer;
    banknoteChecker: BanknoteChecker;
    banknoteAcceptor: BanknoteAcceptor;
}

function buildHarness(fare = 1): Harness {
    const sfsm = new Sfsm({ byMissingTransition: "error", byMissingData: "error" });

    const device = new TurnstileDevice();
    const coinChecker = new CoinChecker();
    const coinAcceptor = new CoinAcceptor(fare);
    const changer = new Changer();
    const banknoteChecker = new BanknoteChecker();
    const banknoteAcceptor = new BanknoteAcceptor(fare);

    const service = new TurnstileService();

    new ControllerHub()
        .registerSignalSender(service)
        .registerSignalSender(device)
        .registerCommandReceiver(device)
        .registerSignalSender(coinChecker)
        .registerCommandReceiver(coinChecker)
        .registerSignalSender(coinAcceptor)
        .registerCommandReceiver(coinAcceptor)
        .registerSignalSender(changer)
        .registerCommandReceiver(changer)
        .registerSignalSender(banknoteChecker)
        .registerCommandReceiver(banknoteChecker)
        .registerSignalSender(banknoteAcceptor)
        .registerCommandReceiver(banknoteAcceptor)
        .connectTo(sfsm);

    sfsm.loadFA(loadCompactTurnstileFa());

    return { sfsm, service, device, coinChecker, coinAcceptor, changer, banknoteChecker, banknoteAcceptor };
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe("SFSM compact – Initialisation", () => {
    it("should be in state I after loadFA", () => {
        const { sfsm } = buildHarness();
        expect(sfsm.getHeadState()).toBe("I");
    });

    it("should transition to Locked (L) after TS.s", () => {
        const { sfsm, service } = buildHarness();
        service.start();
        expect(sfsm.getHeadState()).toBe("L");
    });

    it("root FA name should be TS", () => {
        const { sfsm } = buildHarness();
        expect(sfsm.getCurrentStack()).toEqual(["TS"]);
    });
});

describe("SFSM compact – Turnstile: coin (value=1, no change)", () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);
        h.service.start();
    });

    it("should unlock turnstile after exact-fare coin inserted", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        expect(h.sfsm.getHeadState()).toBe("U");
    });

    it("should issue TS.ut command when coin is valid", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        expect(h.device.getCommandsReceived()).toContain("TS.ut");
    });

    it("should lock turnstile after person passes", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe("L");
    });

    it("should issue TS.l command after passage", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        h.device.triggerPassage();
        expect(h.device.getCommandsReceived()).toContain("TS.l");
    });

    it("should lock turnstile on timeout", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        h.device.triggerTimeout();
        expect(h.sfsm.getHeadState()).toBe("L");
    });
});

describe("SFSM compact – Turnstile: coin (value=2, change=1)", () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);
        h.service.start();
    });

    it("should unlock turnstile after coin with change inserted", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 2 });
        expect(h.sfsm.getHeadState()).toBe("U");
    });

    it("should issue CH.c$ command to Changer for change", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 2 });
        expect(h.changer.getLastChangeAmount()).toBe(1);
    });

    it("should issue TS.ut after change is dispensed", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 2 });
        expect(h.device.getCommandsReceived()).toContain("TS.ut");
    });

    it("should lock turnstile after person passes following coin-with-change", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 2 });
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe("L");
    });
});

describe("SFSM compact – Turnstile: rejected coin", () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);
        h.coinChecker.setRejectOnNext(true);
        h.service.start();
    });

    it("should be in PP:RE state while rejection is in progress", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        expect(h.sfsm.getCurrentStack()).toEqual(["TS", "PU"]);
        expect(h.sfsm.getHeadState()).toBe("ReB");
    });

    it("should lock turnstile after rejector signals RE.d", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        h.sfsm.receiveSignal("RE.d");
        expect(h.sfsm.getHeadState()).toBe("L");
    });

    it("should issue TS.l command after RE.d completes rejection", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        h.sfsm.receiveSignal("RE.d");
        expect(h.device.getCommandsReceived()).toContain("TS.l");
    });
});

describe("SFSM compact – Turnstile: banknote (value=1, no change)", () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);
        h.service.start();
    });

    it("should unlock turnstile after exact-fare banknote inserted", () => {
        h.sfsm.receiveSignal("BR.bc$", { value: 1 });
        expect(h.sfsm.getHeadState()).toBe("U");
    });

    it("should issue TS.ut command when banknote is valid", () => {
        h.sfsm.receiveSignal("BR.bc$", { value: 1 });
        expect(h.device.getCommandsReceived()).toContain("TS.ut");
    });

    it("should lock turnstile after person passes following banknote payment", () => {
        h.sfsm.receiveSignal("BR.bc$", { value: 1 });
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe("L");
    });

    it("should issue TS.l after passage following banknote payment", () => {
        h.sfsm.receiveSignal("BR.bc$", { value: 1 });
        h.device.triggerPassage();
        expect(h.device.getCommandsReceived()).toContain("TS.l");
    });
});

describe("SFSM compact – Turnstile: banknote (value=10, fare=5, change=5)", () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(5);
        h.service.start();
    });

    it("should unlock turnstile after banknote with change inserted", () => {
        h.sfsm.receiveSignal("BR.bc$", { value: 10 });
        expect(h.sfsm.getHeadState()).toBe("U");
    });

    it("should dispense correct change amount via Changer", () => {
        h.sfsm.receiveSignal("BR.bc$", { value: 10 });
        expect(h.changer.getLastChangeAmount()).toBe(5);
    });

    it("should issue TS.ut after change is dispensed for banknote", () => {
        h.sfsm.receiveSignal("BR.bc$", { value: 10 });
        expect(h.device.getCommandsReceived()).toContain("TS.ut");
    });

    it("should lock turnstile after person passes following banknote-with-change", () => {
        h.sfsm.receiveSignal("BR.bc$", { value: 10 });
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe("L");
    });
});

describe("SFSM compact – Turnstile: rejected banknote", () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);
        h.banknoteChecker.setRejectOnNext(true);
        h.service.start();
    });

    it("should be in PP:RE state while rejection is in progress", () => {
        h.sfsm.receiveSignal("BR.bc$", { value: 1 });
        expect(h.sfsm.getCurrentStack()).toEqual(["TS", "PU"]);
        expect(h.sfsm.getHeadState()).toBe("ReB");
    });

    it("should lock turnstile after rejector signals RE.d", () => {
        h.sfsm.receiveSignal("BR.bc$", { value: 1 });
        h.sfsm.receiveSignal("RE.d");
        expect(h.sfsm.getHeadState()).toBe("L");
    });

    it("should issue TS.l command after banknote rejection completes", () => {
        h.sfsm.receiveSignal("BR.bc$", { value: 1 });
        h.sfsm.receiveSignal("RE.d");
        expect(h.device.getCommandsReceived()).toContain("TS.l");
    });
});

describe("SFSM compact – Turnstile: sequential transactions", () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);
        h.service.start();
    });

    it("should handle two successive coin payments correctly", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        expect(h.sfsm.getHeadState()).toBe("U");
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe("L");

        h.device.reset();
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        expect(h.sfsm.getHeadState()).toBe("U");
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe("L");
    });

    it("should handle coin payment followed by banknote payment", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe("L");

        h.device.reset();
        h.sfsm.receiveSignal("BR.bc$", { value: 1 });
        expect(h.sfsm.getHeadState()).toBe("U");
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe("L");
    });
});

describe("SFSM compact – Stack inspection", () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);
        h.service.start();
    });

    it("root stack is ['TS'] after start", () => {
        expect(h.sfsm.getCurrentStack()).toEqual(["TS"]);
    });

    it("stack grows to ['TS','PP','CPP'] when entering coin payment sub-FA", () => {
        const device2 = new TurnstileDevice();
        const absorb = new AbsorbingCommandReceiver(["CC.cw$", "CC.cf$", "CA.a$", "CH.c$", "BC.c$", "BA.a$"]);
        new ControllerHub()
            .registerSignalSender(device2)
            .registerCommandReceiver(device2)
            .registerCommandReceiver(absorb)
            .connectTo(h.sfsm);

        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        expect(h.sfsm.getCurrentStack()).toEqual(["TS", "PU", "CPU"]);
        expect(h.sfsm.getHeadState()).toBe("CW");
    });

    it("stack returns to ['TS'] after full transaction", () => {
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        h.device.triggerPassage();
        expect(h.sfsm.getCurrentStack()).toEqual(["TS"]);
    });
});

describe("SFSM compact – Policy: byMissingTransition", () => {
    it("'ignore' policy: unknown signal in current state does nothing", () => {
        const sfsm = new Sfsm({ byMissingTransition: "ignore" });
        sfsm.loadFA(loadCompactTurnstileFa());
        expect(() => sfsm.receiveSignal("UNKNOWN.xyz")).not.toThrow();
        expect(sfsm.getHeadState()).toBe("I");
    });

    it("'log_warning' policy: unknown signal produces a console.warn, no throw", () => {
        const sfsm = new Sfsm({ byMissingTransition: "log_warning" });
        sfsm.loadFA(loadCompactTurnstileFa());
        const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => { /* suppress */ });
        expect(() => sfsm.receiveSignal("UNKNOWN.xyz")).not.toThrow();
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("UNKNOWN.xyz"));
        expect(sfsm.getHeadState()).toBe("I");
        warnSpy.mockRestore();
    });

    it("'error' policy (default): unknown signal throws", () => {
        const sfsm = new Sfsm({ byMissingTransition: "error" });
        sfsm.loadFA(loadCompactTurnstileFa());
        expect(() => sfsm.receiveSignal("UNKNOWN.xyz")).toThrow();
    });
});

describe("SFSM compact – loadFA resets state", () => {
    it("calling loadFA a second time resets the engine to state I", () => {
        const { sfsm, service } = buildHarness();
        service.start();
        expect(sfsm.getHeadState()).toBe("L");

        sfsm.loadFA(loadCompactTurnstileFa());
        expect(sfsm.getHeadState()).toBe("I");
        expect(sfsm.getCurrentStack()).toEqual(["TS"]);
        expect(sfsm.getLog()).toHaveLength(0);
    });
});

describe("SFSM compact – Log correctness", () => {
    it("first log entry should have correct stack and signal after TS.s", () => {
        const { sfsm, service } = buildHarness();
        service.start();
        const log = sfsm.getLog();
        expect(log[0].signal).toBe("TS.s");
        expect(log[0].stack).toEqual(["TS"]);
        expect(log[0].state).toBe("I");
        expect(log[0].newState).toBe("L");
        expect(log[0].rule).toBe("2.1");
    });

    it("compact log entries should not contain metadata name fields", () => {
        const { sfsm, service } = buildHarness();
        service.start();
        const log = sfsm.getLog();
        expect(log[0].stateName).toBeUndefined();
        expect(log[0].signalName).toBeUndefined();
        expect(log[0].newStateName).toBeUndefined();
    });
});
