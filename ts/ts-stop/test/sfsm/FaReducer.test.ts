import * as path from "path";
import * as fs from "fs";
import { FaDefinition, FaNode, Transition } from "../../src/sfsm/types";
import { reduceFA } from "../../src/sfsm";
import { Sfsm } from "../../src/sfsm/Sfsm";
import { ICommandReceiver } from "../../src/sfsm/interfaces";
import { RecordingReceiver } from "./RecordingReceiver";

/**
 * reduceFA tests.
 *
 * These tests exercise the `reduceFA` utility, which converts an extended
 * FaNode-format FA definition (with states/signals/commands/ts metadata)
 * into the compact multi-FA format (`Record<string, Transition[]>`).
 *
 * The first three describe blocks verify the output shape of reduceFA
 * against the turnstile FA fixtures in test-data/. The last describe
 * block verifies that a reduced (compact) FA behaves identically to its
 * extended source when loaded into the SFSM engine — using an embedded
 * extended FA and a minimal RecordingReceiver instead of external
 * simulators and TransceiverHub.
 */

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

    it("should contain all FA names: TS, PP, BPU, CPP", () => {
        expect(Object.keys(reduced)).toContain("TS");
        expect(Object.keys(reduced)).toContain("PU");
        expect(Object.keys(reduced)).toContain("BPU");
        expect(Object.keys(reduced)).toContain("CPU");
    });

    it("TS transitions should match original ts array", () => {
        const tsTransitions = reduced["TS"] as Transition[];
        expect(tsTransitions).toEqual([
            ["TS:I", "TS>start", "TS:Locked"],
            ["TS:Locked", "BPU>Banknote candidate inserted", "PU"],
            ["TS:Locked", "CPU>Coin candidate inserted", "PU"],
            ["PU", "BPU>Banknote change not needed", "TS:Unlocked", "TS.unlock"],
            ["PU", "CPU>Change is not needed", "TS:Unlocked", "TS.unlock"],
            ["PU", "CCM>Change is done", "TS:Unlocked", "TS.unlock"],
            ["PU", "ReB>Rejection done", "TS:Locked", "TS.lock"],
            ["TS:Unlocked", "TS>timeout", "TS:Locked", "TS.lock"],
            ["TS:Unlocked", "TS>pass", "TS:Locked", "TS.lock"]
        ]);
    });

    it("BPU transitions should match original ts array", () => {
        const bppTransitions = reduced["BPU"] as Transition[];
        expect(bppTransitions).toEqual([
            ["BPU:I", "BPU>Banknote candidate inserted", "BPU:Check of banknote", "BPU.check banknote"],
            ["BPU:Check of banknote", "BPU>Banknote is ok", "BPU:Acceptance of banknote", "BPU.accept banknote"],
            ["BPU:Check of banknote", "BPU>Banknote is false", "E_Rejected"],
            ["BPU:Acceptance of banknote", "BPU>Banknote change needed", "E_Change needed"],
            ["BPU:Acceptance of banknote", "BPU>Banknote change not needed", "E_Change not needed"]
        ]);
    });

    it("CPU transitions should match original ts array", () => {
        const cpuTransitions = reduced["CPU"] as Transition[];
        expect(cpuTransitions).toEqual([
            ["CPU:I", "CPU>Coin candidate inserted", "CPU:Check of coin weight", "CPU.Check coin weight"],
            ["CPU:Check of coin weight", "CPU>Coin is OK", "CPU:Check of coin form", "CPU.Check coin form"],
            ["CPU:Check of coin form", "CPU>Coin is OK", "CPU:Acceptance of coin", "CPU.accept coin"],
            ["CPU:Check of coin weight", "CPU>Coin rejected", "E_Rejected"],
            ["CPU:Check of coin form", "CPU>Coin rejected", "E_Rejected"],
            ["CPU:Acceptance of coin", "CPU>Change is needed", "E_Change needed"],
            ["CPU:Acceptance of coin", "CPU>Change is not needed", "E_Change not needed"]
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
                    ["I", "BPU>Banknote candidate inserted", "BPU:Check of banknote", "BPU.check banknote"],
                    ["BPU:Check of banknote", "BPU>Banknote is ok", "BPU:Acceptance of banknote", "BPU.accept banknote"],
                    ["BPU:Check of banknote", "BPU>Banknote is false", "E_Rejected"],
                    ["BPU:Acceptance of banknote", "BPU>Banknote change needed", "E_Change needed"],
                    ["BPU:Acceptance of banknote", "BPU>Banknote change not needed", "E_Change not needed"]
                ]
            }
        };

        const result = reduceFA(singleFa);
        expect(Object.keys(result)).toEqual(["BPU"]);
        expect(Array.isArray(result["BPU"])).toBe(true);
        expect(result["BPU"]).toEqual((singleFa["BPU"] as FaNode).ts);
    });
});

// ---------------------------------------------------------------------------
// reduceFA – round-trip: reduce then load produces same behaviour
// ---------------------------------------------------------------------------

/**
 * Embedded extended FA used for round-trip testing: a small stacked FA
 * with a sub-FA. Reducing it should produce a compact multi-FA definition
 * that behaves identically when loaded into the SFSM engine.
 */
const extendedRoundTripFa: FaDefinition = {
    Parent: {
        states: {
            'I': { name: 'Initial' },
            'Done': { name: 'Done' },
            'Child': {
                states: {
                    'I': { name: 'Child initial' },
                    'Working': { name: 'Working' },
                    'E_done': { name: 'Child done' }
                },
                signals: {
                    'start': { name: 'Start' },
                    'work': { name: 'Work' },
                    'finish': { name: 'Finish' }
                },
                ts: [
                    ['I', 'start', 'Working'],
                    ['Working', 'work', 'Working'],
                    ['Working', 'finish', 'E_done']
                ]
            }
        },
        signals: {
            'start': { name: 'Start' },
            'finish': { name: 'Finish' }
        },
        ts: [
            ['I', 'start', 'Child'],
            ['Child', 'finish', 'Done']
        ]
    }
};

describe("reduceFA – round-trip: reduce then load produces same behaviour", () => {
    let reduced: FaDefinition;

    beforeAll(() => {
        reduced = reduceFA(extendedRoundTripFa);
    });

    it("reduced output should contain only Transition arrays", () => {
        for (const [, value] of Object.entries(reduced)) {
            expect(Array.isArray(value)).toBe(true);
        }
    });

    it("reduced output should contain Parent and Child keys", () => {
        expect(Object.keys(reduced)).toContain("Parent");
        expect(Object.keys(reduced)).toContain("Child");
    });

    it("reduced FA loads into Sfsm and reaches the same state as the extended FA", () => {
        const sfsmReduced = new Sfsm();
        sfsmReduced.loadFA(reduced);

        const sfsmExtended = new Sfsm();
        sfsmExtended.loadFA(extendedRoundTripFa);

        // Both engines start at I on the root FA.
        expect(sfsmReduced.getHeadState()).toBe(sfsmExtended.getHeadState());

        // Push the child FA and drive it to Working.
        sfsmReduced.receiveSignal('start');
        sfsmExtended.receiveSignal('start');
        expect(sfsmReduced.getCurrentStack()).toEqual(['Parent', 'Child']);
        expect(sfsmReduced.getCurrentStack()).toEqual(sfsmExtended.getCurrentStack());
        expect(sfsmReduced.getHeadState()).toBe('Working');
        expect(sfsmReduced.getHeadState()).toBe(sfsmExtended.getHeadState());

        // Drive the child to its exit state — should pop and land in Done.
        sfsmReduced.receiveSignal('finish');
        sfsmExtended.receiveSignal('finish');
        expect(sfsmReduced.getCurrentStack()).toEqual(['Parent']);
        expect(sfsmReduced.getCurrentStack()).toEqual(sfsmExtended.getCurrentStack());
        expect(sfsmReduced.getHeadState()).toBe('Done');
        expect(sfsmReduced.getHeadState()).toBe(sfsmExtended.getHeadState());
    });

    it("reduced FA fires the same commands as the extended FA", () => {
        // Use an extended FA with a command, reduce it, and verify the
        // reduced compact FA fires the same command.
        const extendedWithCommand: FaDefinition = {
            Device: {
                states: { 'I': { name: 'Initial' }, 'A': { name: 'A' } },
                signals: { 'go': { name: 'Go' } },
                commands: { 'ping': { name: 'Ping', receiver: 'PingController' } },
                ts: [['I', 'go', 'A', 'ping']]
            }
        };

        const reducedWithCommand = reduceFA(extendedWithCommand);

        const recReduced = new RecordingReceiver();
        const sfsmReduced = new Sfsm();
        sfsmReduced.setCommandReceiver(recReduced);
        sfsmReduced.loadFA(reducedWithCommand);

        const recExtended = new RecordingReceiver();
        const sfsmExtended = new Sfsm();
        sfsmExtended.setCommandReceiver(recExtended);
        sfsmExtended.loadFA(extendedWithCommand);

        sfsmReduced.receiveSignal('go');
        sfsmExtended.receiveSignal('go');

        expect(recReduced.calls).toEqual(recExtended.calls);
        expect(recReduced.calls).toHaveLength(1);
        expect(recReduced.calls[0].command).toBe('ping');
    });

    it("reduced FA log entries have no metadata name fields (compact format)", () => {
        const sfsmReduced = new Sfsm();
        sfsmReduced.loadFA(reduced);

        sfsmReduced.receiveSignal('start');
        const log = sfsmReduced.getLog();
        expect(log[0].stateName).toBeUndefined();
        expect(log[0].signalName).toBeUndefined();
        expect(log[0].newStateName).toBeUndefined();
    });
});