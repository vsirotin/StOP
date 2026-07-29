import * as path from "path";
import * as fs from "fs";
import { FaDefinition, Transition } from "../../src/sfsm";
import { reduceFA } from "../../src/sfsm";
import { Sfsm, ControllerHub } from "../../src/sfsm";
import { TurnstileService } from "./simulators/TurnstileService";
import { TurnstileDevice } from "./simulators/TurnstileDevice";
import { CoinChecker } from "./simulators/CoinChecker";
import { CoinAcceptor } from "./simulators/CoinAcceptor";
import { Changer } from "./simulators/Changer";
import { BanknoteChecker } from "./simulators/BanknoteChecker";
import { BanknoteAcceptor } from "./simulators/BanknoteAcceptor";

function loadExtendedFa(): FaDefinition {
    const p = path.resolve(__dirname, "test-data/turnstile-fa.json");
    return JSON.parse(fs.readFileSync(p, "utf-8")) as FaDefinition;
}

function loadCompactFa(): FaDefinition {
    const p = path.resolve(__dirname, "test-data/turnstile-fa-compact.json");
    return JSON.parse(fs.readFileSync(p, "utf-8")) as FaDefinition;
}

// ---------------------------------------------------------------------------
// reduceFA – output shape
// ---------------------------------------------------------------------------

describe("reduceFA – output shape", () => {
    let reduced: FaDefinition;

    beforeAll(() => {
        reduced = reduceFA(loadExtendedFa());
    });

    it("should return an object", () => {
        expect(typeof reduced).toBe("object");
        expect(reduced).not.toBeNull();
    });

    it("all values in the output should be Transition arrays", () => {
        for (const [key, value] of Object.entries(reduced)) {
            expect(Array.isArray(value)).toBe(true); // key: ${key}
        }
    });

    it("should contain all FA names: TS, PP, BPP, CPP", () => {
        expect(Object.keys(reduced)).toContain("TS");
        expect(Object.keys(reduced)).toContain("PU");
        expect(Object.keys(reduced)).toContain("BPU");
        expect(Object.keys(reduced)).toContain("CPU");
    });

    it("TS transitions should match original ts array", () => {
        const tsTransitions = reduced["TS"] as Transition[];
        expect(tsTransitions).toEqual([
            ["TS:I", "TS>start", "TS:Locked"],
            ["TS:Locked", "BR.bc$", "PU"],
            ["TS:Locked", "CR.cc$", "PU"],
            ["PU", "BA.n", "TS:Unlocked", "TS.unlock"],
            ["PU", "CA.n", "TS:Unlocked", "TS.unlock"],
            ["PU", "CH.d", "TS:Unlocked", "TS.unlock"],
            ["PU", "RE.d", "TS:Locked", "TS.lock"],
            ["TS:Unlocked", "TS>timeout", "TS:Locked", "TS.lock"],
            ["TS:Unlocked", "TS>pass", "TS:Locked", "TS.lock"]
        ]);
    });

    it("BPU transitions should match original ts array", () => {
        const bppTransitions = reduced["BPU"] as Transition[];
        expect(bppTransitions).toEqual([
            ["BPU:I", "BR.bc$", "BPU:Check of banknote", "BC.c$"],
            ["BPU:Check of banknote", "BC.p$", "BPU:Acceptance of banknote", "BA.a$"],
            ["BPU:Check of banknote", "BC.r$", "E_R"],
            ["BPU:Acceptance of banknote", "BA.c$", "E_C"],
            ["BPU:Acceptance of banknote", "BA.n", "E_N"]
        ]);
    });

    it("CPU transitions should match original ts array", () => {
        const cpuTransitions = reduced["CPU"] as Transition[];
        expect(cpuTransitions).toEqual([
            ["CPU:I", "CR.cc$", "CW", "CC.cw$"],
            ["CW", "CC.p$", "CF", "CC.cf$"],
            ["CF", "CC.p$", "BPU:Acceptance of banknote", "CA.a$"],
            ["CW", "CC.r$", "E_R"],
            ["CF", "CC.r$", "E_R"],
            ["BPU:Acceptance of banknote", "CA.c$", "E_C"],
            ["BPU:Acceptance of banknote", "CA.n", "E_N"]
        ]);
    });
});

// ---------------------------------------------------------------------------
// reduceFA – already-compact input
// ---------------------------------------------------------------------------

describe("reduceFA – already-compact input is returned unchanged", () => {
    it("should return the same structure for compact input", () => {
        const compact = loadCompactFa();
        const result = reduceFA(compact);
        expect(result).toEqual(compact);
    });
});

// ---------------------------------------------------------------------------
// reduceFA – single-level FA (BPP-like)
// ---------------------------------------------------------------------------

describe("reduceFA – single-level extended FA", () => {
    it("should reduce a single-level extended FA correctly", () => {
        const singleFa: FaDefinition = {
            "BPU": {
                ts: [
                    ["I", "BR.bc$", "BPU:Check of banknote", "BC.c$"],
                    ["BPU:Check of banknote", "BC.p$", "BPU:Acceptance of banknote", "BA.a$"],
                    ["BPU:Check of banknote", "BC.r$", "E_R"],
                    ["BPU:Acceptance of banknote", "BA.c$", "E_C"],
                    ["BPU:Acceptance of banknote", "BA.n", "E_N"]
                ]
            }
        };

        const result = reduceFA(singleFa);
        expect(Object.keys(result)).toEqual(["BPU"]);
        expect(Array.isArray(result["BPU"])).toBe(true);
        expect(result["BPU"]).toEqual((singleFa["BPU"] as import("../../src/sfsm").FaNode).ts);
    });
});

// ---------------------------------------------------------------------------
// reduceFA – round-trip
// ---------------------------------------------------------------------------

describe("reduceFA – round-trip: reduce then load produces same behaviour", () => {
    function buildHarness(fare: number, definition: FaDefinition) {
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

        sfsm.loadFA(definition);
        return { sfsm, service, device, changer };
    }

    it("coin exact fare: reduced FA reaches U then L after passage", () => {
        const reduced = reduceFA(loadExtendedFa());
        const h = buildHarness(1, reduced);
        h.service.start();
        h.sfsm.receiveSignal("CR.cc$", { value: 1 });
        expect(h.sfsm.getHeadState()).toBe("TS:Unlocked");
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe("TS:Locked");
    });

    it("coin with change: reduced FA dispenses correct change and reaches U", () => {
        const reduced = reduceFA(loadExtendedFa());
        const h = buildHarness(1, reduced);
        h.service.start();
        h.sfsm.receiveSignal("CR.cc$", { value: 2 });
        expect(h.changer.getLastChangeAmount()).toBe(1);
        expect(h.sfsm.getHeadState()).toBe("TS:Unlocked");
    });

    it("banknote exact fare: reduced FA reaches U then L after passage", () => {
        const reduced = reduceFA(loadExtendedFa());
        const h = buildHarness(1, reduced);
        h.service.start();
        h.sfsm.receiveSignal("BR.bc$", { value: 1 });
        expect(h.sfsm.getHeadState()).toBe("TS:Unlocked");
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe("TS:Locked");
    });

    it("reduced FA log entry has no metadata name fields", () => {
        const reduced = reduceFA(loadExtendedFa());
        const h = buildHarness(1, reduced);
        h.service.start();
        const log = h.sfsm.getLog();
        expect(log[0].stateName).toBeUndefined();
        expect(log[0].signalName).toBeUndefined();
    });
});
