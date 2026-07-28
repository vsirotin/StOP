import * as path from "path";
import * as fs from "fs";
import * as yaml from "js-yaml";
import { Sfsm, FaDefinition, LogEntry, ControllerHub } from "../../src/sfsm";
import { TurnstileService } from "./simulators/TurnstileService";
import { TurnstileDevice } from "./simulators/TurnstileDevice";
import { CoinChecker } from "./simulators/CoinChecker";
import { CoinAcceptor } from "./simulators/CoinAcceptor";
import { Changer } from "./simulators/Changer";

// ---------------------------------------------------------------------------
// Run full "coin value=2, then passage" scenario and capture log
// ---------------------------------------------------------------------------

let log: LogEntry[] = [];

beforeAll(() => {
    const fa = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, "test-data/turnstile-fa.json"), "utf-8")
    ) as FaDefinition;

    const sfsm = new Sfsm({ byMissingTransition: "error", byMissingData: "error" });

    const device = new TurnstileDevice();
    const coinChecker = new CoinChecker();
    const coinAcceptor = new CoinAcceptor(1);   // fare = 1
    const changer = new Changer();

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
        .connectTo(sfsm);

    sfsm.loadFA(fa);

    service.start();                              // step 1: I → L
    sfsm.receiveSignal("CR.cc$", { value: 2 });  // cascade: L → PP → CPP → ... → U
    device.triggerPassage();                      // U → L

    log = sfsm.getLog();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SFSM – Log: coin (value=2) with change, then passage", () => {

    it("should produce a non-empty log", () => {
        expect(log.length).toBeGreaterThan(0);
    });

    it("should record at least the expected minimum number of steps (≥ 7)", () => {
        // Known minimum from mental simulation:
        // 1: TS(I→L), 2: TS(L→PP), 3: PP(I→CPP), 4: CPP(I→CW),
        // 5: CPP(CW→CF), 6: CPP(CF→A), 7: CPP(A→E_C/pop→PP),
        // 8: PP(CPP→CH), 9: PP(CH→E_P/pop→TS), 10: TS(PP→U),
        // 11: TS(U→L from TS.ps)
        expect(log.length).toBeGreaterThanOrEqual(7);
    });

    it("step 1 should have signal TS.s and new state L", () => {
        const step1 = log.find(e => e.signal === "TS.s");
        expect(step1).toBeDefined();
        expect(step1!.newState).toBe("L");
    });

    it("should contain an entry where CR.cc$ causes transition to sub-FA PP", () => {
        const entry = log.find(e => e.signal === "CR.cc$" && e.newState === "PU");
        expect(entry).toBeDefined();
    });

    it("should contain an entry where TS.ut command is issued", () => {
        const entry = log.find(e => e.command === "TS.ut");
        expect(entry).toBeDefined();
        expect(entry!.newState).toBe("U");
    });

    it("should contain an entry where TS.ps causes transition to L with TS.l command", () => {
        const entry = log.find(e => e.signal === "TS.ps");
        expect(entry).toBeDefined();
        expect(entry!.newState).toBe("L");
        expect(entry!.command).toBe("TS.l");
    });

    it("each log step number should be sequential starting at 1", () => {
        log.forEach((entry, index) => {
            expect(entry.step).toBe(index + 1);
        });
    });

    it("each log entry should have a non-empty stack", () => {
        log.forEach(entry => {
            expect(entry.stack.length).toBeGreaterThan(0);
        });
    });
});

describe("SFSM – Log: YAML format validity", () => {

    it("getLog() result should be parseable as a YAML array", () => {
        // Minimal check: the raw LogEntry[] can be serialised and reparsed via js-yaml
        const yamlStr = yaml.dump(log);
        const parsed = yaml.load(yamlStr);
        expect(Array.isArray(parsed)).toBe(true);
        expect((parsed as unknown[]).length).toBe(log.length);
    });
});
