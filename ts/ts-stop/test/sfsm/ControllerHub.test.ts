import { ControllerHub, ICommandReceiver, ISignalReceiver, Sfsm, SignalSender, CommandReceiver } from "../../src/sfsm";

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

class StubReceiver extends CommandReceiver {
    received: Array<{ command: string; data: unknown }> = [];
    constructor(private readonly commands: string[]) { super(); }
    getCommandNames(): readonly string[] { return this.commands; }
    receiveCommand(command: string, data?: unknown): void {
        this.received.push({ command, data });
    }
}

class StubSender extends SignalSender {
    target: ISignalReceiver | null = null;
    constructor(private readonly signals: string[]) { super(); }
    getSignalNames(): readonly string[] { return this.signals; }
    override connectSignalTarget(t: ISignalReceiver): void {
        this.target = t;
        super.connectSignalTarget(t);
    }
}

class StubSenderAndReceiver extends SignalSender implements ICommandReceiver {
    target: ISignalReceiver | null = null;
    received: string[] = [];
    constructor(private readonly signals: string[], private readonly commands: string[]) { super(); }
    getSignalNames(): readonly string[] { return this.signals; }
    getCommandNames(): readonly string[] { return this.commands; }
    override connectSignalTarget(t: ISignalReceiver): void {
        this.target = t;
        super.connectSignalTarget(t);
    }
    receiveCommand(command: string): void { this.received.push(command); }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ControllerHub – registerCommandReceiver / receiveCommand", () => {

    it("test_receiveCommand_routesToRegisteredReceiver", () => {
        const hub = new ControllerHub();
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
        const hub = new ControllerHub();
        hub.registerCommandReceiver(new StubReceiver(["X.a"]));

        expect(() => hub.receiveCommand("Y.z")).toThrow(
            /no receiver registered for command "Y\.z"/
        );
    });

    it("test_receiveCommand_errorMessageListsRegisteredCommands", () => {
        const hub = new ControllerHub();
        hub.registerCommandReceiver(new StubReceiver(["A.x"]));
        hub.registerCommandReceiver(new StubReceiver(["B.y"]));

        expect(() => hub.receiveCommand("Z.unknown")).toThrow(/A\.x.*B\.y|B\.y.*A\.x/);
    });

    it("test_registerCommandReceiver_throwsOnDuplicateCommandName", () => {
        const hub = new ControllerHub();
        hub.registerCommandReceiver(new StubReceiver(["X.a"]));

        expect(() => hub.registerCommandReceiver(new StubReceiver(["X.a"]))).toThrow(
            /command "X\.a" is already registered/
        );
    });

    it("test_registerCommandReceiver_throwsOnDuplicateInSameCall", () => {
        const hub = new ControllerHub();
        hub.registerCommandReceiver(new StubReceiver(["X.a"]));

        expect(() =>
            hub.registerCommandReceiver(new StubReceiver(["X.b", "X.a"]))
        ).toThrow(/command "X\.a" is already registered/);
    });
});

describe("ControllerHub – registerSignalSender / connectTo", () => {

    it("test_connectTo_callsConnectSignalTargetOnAllSenders", () => {
        const sfsm = new Sfsm();
        const s1 = new StubSender(["A.x"]);
        const s2 = new StubSender(["B.y"]);

        new ControllerHub()
            .registerSignalSender(s1)
            .registerSignalSender(s2)
            .connectTo(sfsm);

        expect(s1.target).toBe(sfsm);
        expect(s2.target).toBe(sfsm);
    });

    it("test_connectTo_setsHubAsCommandReceiverOnSfsm", () => {
        const sfsm = new Sfsm();
        new ControllerHub()
            .registerCommandReceiver(new StubReceiver(["X.a"]))
            .connectTo(sfsm);

        // Verify by loading a minimal FA and firing a command-triggering signal
        sfsm.loadFA({ "Root": [["I", "s", "E_1", "X.a"]] });

        // hub must be wired as command receiver — no throw expected
        expect(() => sfsm.receiveSignal("s")).not.toThrow();
    });

    it("test_connectTo_isFluentAndReturnsSameHub", () => {
        const sfsm = new Sfsm();
        const hub = new ControllerHub();
        const result = hub.connectTo(sfsm);
        expect(result).toBe(hub);
    });
});

describe("ControllerHub – diagnostic accessors", () => {

    it("test_getRegisteredCommands_returnsAllCommandNames", () => {
        const hub = new ControllerHub();
        hub.registerCommandReceiver(new StubReceiver(["A.x", "A.y"]));
        hub.registerCommandReceiver(new StubReceiver(["B.z"]));

        expect(hub.getRegisteredCommands().sort()).toEqual(["A.x", "A.y", "B.z"]);
    });

    it("test_getRegisteredSignals_returnsAllSignalNames", () => {
        const hub = new ControllerHub();
        hub.registerSignalSender(new StubSender(["X.a", "X.b"]));
        hub.registerSignalSender(new StubSender(["Y.c"]));

        expect(hub.getRegisteredSignals().sort()).toEqual(["X.a", "X.b", "Y.c"]);
    });

    it("test_getRegisteredCommands_returnsEmptyWhenNoneRegistered", () => {
        expect(new ControllerHub().getRegisteredCommands()).toEqual([]);
    });

    it("test_getRegisteredSignals_returnsEmptyWhenNoneRegistered", () => {
        expect(new ControllerHub().getRegisteredSignals()).toEqual([]);
    });
});

describe("ControllerHub – fluent chain", () => {

    it("test_fluentChain_registerAndConnect_worksEndToEnd", () => {
        const sfsm = new Sfsm();
        const device = new StubSenderAndReceiver(["D.on", "D.off"], ["D.cmd"]);

        new ControllerHub()
            .registerSignalSender(device)
            .registerCommandReceiver(device)
            .connectTo(sfsm);

        // Signal target was wired
        expect(device.target).toBe(sfsm);

        // Command routing works
        const hub = new ControllerHub().registerCommandReceiver(device);
        hub.receiveCommand("D.cmd");
        expect(device.received).toEqual(["D.cmd"]);
    });

    it("test_registerCommandReceiver_isFluentAndReturnsSameHub", () => {
        const hub = new ControllerHub();
        const result = hub.registerCommandReceiver(new StubReceiver(["A.x"]));
        expect(result).toBe(hub);
    });

    it("test_registerSignalSender_isFluentAndReturnsSameHub", () => {
        const hub = new ControllerHub();
        const result = hub.registerSignalSender(new StubSender(["A.x"]));
        expect(result).toBe(hub);
    });
});

describe("ControllerHub – device implementing both roles", () => {

    it("test_dualRoleDevice_wireBothSidesCorrectly", () => {
        const sfsm = new Sfsm();
        const device = new StubSenderAndReceiver(["D.sig"], ["D.cmd"]);

        const hub = new ControllerHub()
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
