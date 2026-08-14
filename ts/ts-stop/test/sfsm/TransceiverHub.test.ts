import { TransceiverHub, ICommandReceiver, ISignalReceiver, ITransceiver, Sfsm, ISignalSender } from "../../src/sfsm";

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

class StubReceiver implements ICommandReceiver {
    received: Array<{ command: string; data: unknown }> = [];
    constructor(private readonly commands: string[]) { }
    getCommandNames(): readonly string[] { return this.commands; }
    receiveCommand(command: string, data?: unknown): void {
        this.received.push({ command, data });
    }

     receiveSignal(signal: string, data?: unknown): void {
        // Not used in this test
    }
}

class StubSender implements ISignalSender {
    target: ISignalReceiver | null = null;
    constructor(private readonly signals: string[]) { }
    getSignalNames(): readonly string[] { return this.signals; }
    connectSignalTarget(t: ISignalReceiver): void {
        this.target = t;
    }
    sendSignal(name: string, data?: unknown): void {
        //Not used in this test
    }
}

class MockTransceiver implements ITransceiver {
    target: ISignalReceiver | null = null;
    received: string[] = [];
    constructor(private readonly signals: string[], private readonly commands: string[]) { }
    getSignalNames(): readonly string[] { return this.signals; }
    getCommandNames(): readonly string[] { return this.commands; }
    connectSignalTarget(t: ISignalReceiver): void {
        this.target = t;
    }
    receiveCommand(command: string, data?: unknown): void { this.received.push(command); }

    sendSignal(name: string, data?: unknown): void {
        // Not used in this test
    }

    receiveSignal(signal: string, data?: unknown): void {
        // Not used in this test
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TransceiverHub – registerCommandReceiver / receiveCommand", () => {

    it("test_receiveCommand_routesToRegisteredReceiver", () => {
        const hub = new TransceiverHub();
        const recv = new StubReceiver(["X.a", "X.b"]);
        hub.registerCommandReceiver(recv);

        hub.receiveCommand("X.a", 42);
        hub.receiveCommand("X.b");

        expect(recv.received).toEqual([
            { command: "X.a", data: 42 },
            { command: "X.b", data: undefined },
        ]);
    });

    it("test_receiveCommand_throwsWithDescriptiveMessageForUnknownCommand", () => {
        const hub = new TransceiverHub();
        hub.registerCommandReceiver(new StubReceiver(["X.a"]));

        expect(() => hub.receiveCommand("Y.z")).toThrow(
            /no receiver registered for command "Y\.z"/
        );
    });

    it("test_receiveCommand_errorMessageListsRegisteredCommands", () => {
        const hub = new TransceiverHub();
        hub.registerCommandReceiver(new StubReceiver(["A.x"]));
        hub.registerCommandReceiver(new StubReceiver(["B.y"]));

        expect(() => hub.receiveCommand("Z.unknown")).toThrow(/A\.x.*B\.y|B\.y.*A\.x/);
    });

    it("test_registerCommandReceiver_throwsOnDuplicateCommandName", () => {
        const hub = new TransceiverHub();
        hub.registerCommandReceiver(new StubReceiver(["X.a"]));

        expect(() => hub.registerCommandReceiver(new StubReceiver(["X.a"]))).toThrow(
            /command "X\.a" is already registered/
        );
    });

    it("test_registerCommandReceiver_throwsOnDuplicateInSameCall", () => {
        const hub = new TransceiverHub();
        hub.registerCommandReceiver(new StubReceiver(["X.a"]));

        expect(() =>
            hub.registerCommandReceiver(new StubReceiver(["X.b", "X.a"]))
        ).toThrow(/command "X\.a" is already registered/);
    });
});

describe("TransceiverHub – registerSignalSender / connectTo", () => {

    it("test_connectTo_callsConnectSignalTargetOnAllSenders", () => {
        const sfsm = new Sfsm();
        const s1 = new StubSender(["A.x"]);
        const s2 = new StubSender(["B.y"]);

        new TransceiverHub()
            .registerSignalSender(s1)
            .registerSignalSender(s2)
            .connectTo(sfsm);

        expect(s1.target).toBe(sfsm);
        expect(s2.target).toBe(sfsm);
    });

    it("test_connectTo_setsHubAsCommandReceiverOnSfsm", () => {
        const sfsm = new Sfsm();
        new TransceiverHub()
            .registerCommandReceiver(new StubReceiver(["X.a"]))
            .connectTo(sfsm);

        // Verify by loading a minimal FA and firing a command-triggering signal
        sfsm.loadFA({ "Root": [["I", "s", "E_1", "X.a"]] });

        // hub must be wired as command receiver — no throw expected
        expect(() => sfsm.receiveSignal("s")).not.toThrow();
    });

    it("test_connectTo_isFluentAndReturnsSameHub", () => {
        const sfsm = new Sfsm();
        const hub = new TransceiverHub();
        const result = hub.connectTo(sfsm);
        expect(result).toBe(hub);
    });
});

describe("TransceiverHub – diagnostic accessors", () => {

    it("test_getRegisteredCommands_returnsAllCommandNames", () => {
        const hub = new TransceiverHub();
        hub.registerCommandReceiver(new StubReceiver(["A.x", "A.y"]));
        hub.registerCommandReceiver(new StubReceiver(["B.z"]));

        expect(hub.getRegisteredCommands().sort()).toEqual(["A.x", "A.y", "B.z"]);
    });

    it("test_getRegisteredSignals_returnsAllSignalNames", () => {
        const hub = new TransceiverHub();
        hub.registerSignalSender(new StubSender(["X.a", "X.b"]));
        hub.registerSignalSender(new StubSender(["Y.c"]));

        expect(hub.getRegisteredSignals().sort()).toEqual(["X.a", "X.b", "Y.c"]);
    });

    it("test_getRegisteredCommands_returnsEmptyWhenNoneRegistered", () => {
        expect(new TransceiverHub().getRegisteredCommands()).toEqual([]);
    });

    it("test_getRegisteredSignals_returnsEmptyWhenNoneRegistered", () => {
        expect(new TransceiverHub().getRegisteredSignals()).toEqual([]);
    });
});

describe("TransceiverHub – fluent chain", () => {

    it("test_fluentChain_registerAndConnect_worksEndToEnd", () => {
        const sfsm = new Sfsm();
        const device = new MockTransceiver(["D.on", "D.off"], ["D.cmd"]);

        new TransceiverHub()
            .registerSignalSender(device)
            .registerCommandReceiver(device)
            .connectTo(sfsm);

        // Signal target was wired
        expect(device.target).toBe(sfsm);

        // Command routing works
        const hub = new TransceiverHub().registerCommandReceiver(device);
        hub.receiveCommand("D.cmd");
        expect(device.received).toEqual(["D.cmd"]);
    });

    it("test_registerCommandReceiver_isFluentAndReturnsSameHub", () => {
        const hub = new TransceiverHub();
        const result = hub.registerCommandReceiver(new StubReceiver(["A.x"]));
        expect(result).toBe(hub);
    });

    it("test_registerSignalSender_isFluentAndReturnsSameHub", () => {
        const hub = new TransceiverHub();
        const result = hub.registerSignalSender(new StubSender(["A.x"]));
        expect(result).toBe(hub);
    });
});

describe("TransceiverHub – device implementing both roles", () => {

    it("test_dualRoleDevice_wireBothSidesCorrectly", () => {
        const sfsm = new Sfsm();
        const device = new MockTransceiver(["D.sig"], ["D.cmd"]);

        const hub = new TransceiverHub()
            .registerSignalSender(device)
            .registerCommandReceiver(device);

        hub.connectTo(sfsm);

        // Signal side wired
        expect(device.target).toBe(sfsm);

        // Command side routes
        hub.receiveCommand("D.cmd");
        expect(device.received).toContain("D.cmd");
    });
});
