import * as path from "path";
import * as fs from "fs";
import { loadFAFromFile, loadFAFromURL } from "../../src/sfsm";
import { Sfsm } from "../../src/sfsm/Sfsm";
import { FaDefinition } from "../../src/sfsm/types";
import { RecordingReceiver } from "./RecordingReceiver";

/**
 * loadFAFromFile / loadFAFromURL tests.
 *
 * These tests exercise the FA-loading utilities in isolation (no
 * TransceiverHub, no external simulators). The `loadFAFromFile` integration
 * tests load the turnstile FA fixtures from test-data/ and verify that
 * the loaded definition can be driven through the SFSM engine with a
 * minimal RecordingReceiver. The `loadFAFromURL` tests mock `fetch` to
 * verify HTTP/JSON error handling.
 */

const extendedPath = path.resolve(__dirname, "test-data/turnstile-fa.json");
const compactPath  = path.resolve(__dirname, "test-data/turnstile-fa-compact.json");

// ---------------------------------------------------------------------------
// loadFAFromFile – return value
// ---------------------------------------------------------------------------

describe("loadFAFromFile – return value", () => {
    it("should return an object for the extended FA file", () => {
        const fa = loadFAFromFile(extendedPath);
        expect(typeof fa).toBe("object");
        expect(fa).not.toBeNull();
    });

    it("should contain root key 'TS' for the extended FA file", () => {
        const fa = loadFAFromFile(extendedPath);
        expect(Object.keys(fa)).toContain("TS");
    });

    it("should return an object for the compact FA file", () => {
        const fa = loadFAFromFile(compactPath);
        expect(typeof fa).toBe("object");
        expect(fa).not.toBeNull();
    });

    it("should contain keys TS, PU, BPU, CPU for the compact FA file", () => {
        const fa = loadFAFromFile(compactPath);
        expect(Object.keys(fa)).toContain("TS");
        expect(Object.keys(fa)).toContain("PU");
        expect(Object.keys(fa)).toContain("BPU");
        expect(Object.keys(fa)).toContain("CPU");
    });

    it("should throw when file does not exist", () => {
        expect(() => loadFAFromFile("/non/existent/file.json")).toThrow();
    });
});

// ---------------------------------------------------------------------------
// loadFAFromFile – integration with Sfsm (extended format)
// ---------------------------------------------------------------------------

describe("loadFAFromFile – Sfsm integration with extended FA", () => {
    it("should load and run extended FA from file: TS>start reaches TS:Locked", () => {
        const sfsm = new Sfsm(loadFAFromFile(extendedPath), { byMissingTransition: "error", byMissingData: "error" });
        const rec = new RecordingReceiver();
        sfsm.setCommandReceiver(rec);

        // After loadFA the engine sits at the root entry state.
        expect(sfsm.getCurrentStack()).toEqual(["TS"]);
        expect(sfsm.getHeadState()).toBe("TS:I");

        // The TS>start signal drives the root FA from I to TS:Locked.
        sfsm.receiveSignal("TS>start");
        expect(sfsm.getHeadState()).toBe("TS:Locked");
        expect(sfsm.getCurrentStack()).toEqual(["TS"]);
    });

    it("should load extended FA and produce a log entry for TS>start", () => {
        const sfsm = new Sfsm(loadFAFromFile(extendedPath));

        sfsm.receiveSignal("TS>start");
        const log = sfsm.getLog();
        expect(log).toHaveLength(1);
        expect(log[0].signal).toBe("TS>start");
        expect(log[0].stack).toEqual(["TS"]);
        expect(log[0].state).toBe("TS:I");
        expect(log[0].newState).toBe("TS:Locked");
        expect(log[0].rule).toBe("2.1");
    });
});

// ---------------------------------------------------------------------------
// loadFAFromFile – integration with Sfsm (compact format)
// ---------------------------------------------------------------------------

describe("loadFAFromFile – Sfsm integration with compact FA", () => {
    it("should load and run compact FA from file: TS>start reaches TS:Locked", () => {
        const sfsm = new Sfsm(loadFAFromFile(compactPath), { byMissingTransition: "error", byMissingData: "error" });
        const rec = new RecordingReceiver();
        sfsm.setCommandReceiver(rec);

        // After loadFA the engine sits at the root entry state.
        expect(sfsm.getCurrentStack()).toEqual(["TS"]);
        expect(sfsm.getHeadState()).toBe("I");

        // The TS>start signal drives the root FA from I to TS:Locked.
        sfsm.receiveSignal("TS>start");
        expect(sfsm.getHeadState()).toBe("TS:Locked");
        expect(sfsm.getCurrentStack()).toEqual(["TS"]);
    });

    it("should load compact FA and produce a log entry for TS>start", () => {
        const sfsm = new Sfsm(loadFAFromFile(compactPath));

        sfsm.receiveSignal("TS>start");
        const log = sfsm.getLog();
        expect(log).toHaveLength(1);
        expect(log[0].signal).toBe("TS>start");
        expect(log[0].stack).toEqual(["TS"]);
        expect(log[0].state).toBe("I");
        expect(log[0].newState).toBe("TS:Locked");
        expect(log[0].rule).toBe("2.1");
    });

    it("compact FA log entries should not contain metadata name fields", () => {
        const sfsm = new Sfsm(loadFAFromFile(compactPath));

        sfsm.receiveSignal("TS>start");
        const log = sfsm.getLog();
        expect(log[0].stateName).toBeUndefined();
        expect(log[0].signalName).toBeUndefined();
        expect(log[0].newStateName).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// loadFAFromURL – unit tests (mocked fetch)
// ---------------------------------------------------------------------------

const COMPACT_FA_FIXTURE = {
    TS: [
        ["I", "TS>start", "TS:Locked"],
        ["TS:Locked", "CPU>Coin candidate inserted", "PU"],
        ["PU", "CPU>Change is not needed", "TS:Unlocked", "TS.unlock"],
    ],
    PU: [
        ["I", "CPU>Coin candidate inserted", "CPU"],
        ["CPU", "CPU>Change is not needed", "E_Payment_OK"],
    ],
    CPU: [
        ["I", "CPU>Coin candidate inserted", "CPU:Check of coin weight", "CPU.Check coin weight"],
        ["CPU:Check of coin weight", "CPU>Coin is OK", "CPU:Check of coin form", "CPU.Check coin form"],
    ],
};

const EXTENDED_FA_FIXTURE = {
    TS: {
        ts: [
            ["I", "TS>start", "TS:Locked"],
        ],
    },
};

function makeFetchOk(body: unknown): jest.SpyInstance {
    return jest.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve(body),
    } as Response);
}

function makeFetchError(status: number, statusText: string): jest.SpyInstance {
    return jest.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status,
        statusText,
        json: () => Promise.reject(new Error("not used")),
    } as Response);
}

afterEach(() => {
    jest.restoreAllMocks();
});

describe("loadFAFromURL – return value", () => {
    it("should return the parsed FaDefinition for a compact FA", async () => {
        makeFetchOk(COMPACT_FA_FIXTURE);
        const fa = await loadFAFromURL("https://example.com/turnstile-compact.json");
        expect(fa).toEqual(COMPACT_FA_FIXTURE);
    });

    it("should contain expected top-level keys for a compact FA", async () => {
        makeFetchOk(COMPACT_FA_FIXTURE);
        const fa = await loadFAFromURL("https://example.com/turnstile-compact.json");
        expect(Object.keys(fa)).toContain("TS");
        expect(Object.keys(fa)).toContain("PU");
        expect(Object.keys(fa)).toContain("CPU");
    });

    it("should return the parsed FaDefinition for an extended FA", async () => {
        makeFetchOk(EXTENDED_FA_FIXTURE);
        const fa = await loadFAFromURL("https://example.com/turnstile-extended.json");
        expect(Object.keys(fa)).toContain("TS");
    });
});

describe("loadFAFromURL – HTTP error handling", () => {
    it("should throw on HTTP 404", async () => {
        makeFetchError(404, "Not Found");
        await expect(loadFAFromURL("https://example.com/missing.json"))
            .rejects.toThrow("404");
    });

    it("should throw on HTTP 500", async () => {
        makeFetchError(500, "Internal Server Error");
        await expect(loadFAFromURL("https://example.com/broken.json"))
            .rejects.toThrow("500");
    });

    it("should include the URL in the error message", async () => {
        const url = "https://example.com/not-found.json";
        makeFetchError(404, "Not Found");
        await expect(loadFAFromURL(url))
            .rejects.toThrow(url);
    });
});

describe("loadFAFromURL – network / JSON errors", () => {
    it("should throw when fetch itself rejects (network error)", async () => {
        jest.spyOn(global, "fetch").mockRejectedValue(new Error("Network failure"));
        await expect(loadFAFromURL("https://example.com/fa.json"))
            .rejects.toThrow("Network failure");
    });

    it("should throw when response.json() rejects (invalid JSON body)", async () => {
        jest.spyOn(global, "fetch").mockResolvedValue({
            ok: true,
            status: 200,
            statusText: "OK",
            json: () => Promise.reject(new SyntaxError("Unexpected token")),
        } as Response);
        await expect(loadFAFromURL("https://example.com/bad.json"))
            .rejects.toThrow("Unexpected token");
    });
});