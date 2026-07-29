import * as path from "path";
import { loadFAFromFile, loadFAFromURL } from "../../src/sfsm";
import { Sfsm, ControllerHub } from "../../src/sfsm";
import { TurnstileService } from "./simulators/TurnstileService";
import { TurnstileDevice } from "./simulators/TurnstileDevice";
import { CoinChecker } from "./simulators/CoinChecker";
import { CoinAcceptor } from "./simulators/CoinAcceptor";
import { Changer } from "./simulators/Changer";
import { BanknoteChecker } from "./simulators/BanknoteChecker";
import { BanknoteAcceptor } from "./simulators/BanknoteAcceptor";

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
    it("should load and run extended FA from file: coin exact fare", () => {
        const sfsm = new Sfsm({ byMissingTransition: "error", byMissingData: "error" });
        const device = new TurnstileDevice();
        const coinChecker = new CoinChecker();
        const coinAcceptor = new CoinAcceptor(1);
        const changer = new Changer();
        const banknoteChecker = new BanknoteChecker();
        const banknoteAcceptor = new BanknoteAcceptor(1);

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

        sfsm.loadFA(loadFAFromFile(extendedPath));

        service.start();

        sfsm.receiveSignal("CR.cc$", { value: 1 });
        expect(sfsm.getHeadState()).toBe("TS:Unlocked");
    });
});

// ---------------------------------------------------------------------------
// loadFAFromFile – integration with Sfsm (compact format)
// ---------------------------------------------------------------------------

describe("loadFAFromFile – Sfsm integration with compact FA", () => {
    it("should load and run compact FA from file: coin exact fare", () => {
        const sfsm = new Sfsm({ byMissingTransition: "error", byMissingData: "error" });
        const device = new TurnstileDevice();
        const coinChecker = new CoinChecker();
        const coinAcceptor = new CoinAcceptor(1);
        const changer = new Changer();
        const banknoteChecker = new BanknoteChecker();
        const banknoteAcceptor = new BanknoteAcceptor(1);

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

        sfsm.loadFA(loadFAFromFile(compactPath));

        service.start();

        sfsm.receiveSignal("CR.cc$", { value: 1 });
        expect(sfsm.getHeadState()).toBe("TS:Unlocked");
    });
});

// ---------------------------------------------------------------------------
// loadFAFromURL – unit tests (mocked fetch)
// ---------------------------------------------------------------------------

const COMPACT_FA_FIXTURE = {
    TS: [
        ["I", "TS>start", "TS:Locked"],
        ["TS:Locked", "CR.cc$", "PU"],
        ["PU", "CA.n", "TS:Unlocked", "TS.unlock"],
    ],
    PU: [
        ["I", "CR.cc$", "CPU"],
        ["CPU", "CA.n", "E_P"],
    ],
    CPU: [
        ["I", "CR.cc$", "CW", "CC.cw$"],
        ["CW", "CC.p$", "CF", "CC.cf$"],
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
