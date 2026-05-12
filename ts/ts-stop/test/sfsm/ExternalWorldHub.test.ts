import { ExternalWorldHub, ICommandReceiver, ISignalReceiver, ISignalSender, Sfsm } from '../../src/sfsm';

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

class StubReceiver implements ICommandReceiver {
    received: Array<{ command: string; data: unknown }> = [];
    receiveCommand(command: string, data?: unknown): void {
        this.received.push({ command, data });
    }
}

class StubSender implements ISignalSender {
    target: ISignalReceiver | null = null;
    connectSignalTarget(t: ISignalReceiver): void {
        this.target = t;
    }
}

class StubSenderAndReceiver implements ICommandReceiver, ISignalSender {
    target: ISignalReceiver | null = null;
    received: string[] = [];
    connectSignalTarget(t: ISignalReceiver): void { this.target = t; }
    receiveCommand(command: string): void { this.received.push(command); }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ExternalWorldHub – registerCommandReceiver / receiveCommand', () => {

    it('test_receiveCommand_routesToRegisteredReceiver', () => {
        const hub = new ExternalWorldHub();
        const recv = new StubReceiver();
        hub.registerCommandReceiver(['X.a', 'X.b'], recv);

        hub.receiveCommand('X.a', 42);
        hub.receiveCommand('X.b');

        expect(recv.received).toEqual([
            { command: 'X.a', data: 42 },
            { command: 'X.b', data: undefined },
        ]);
    });

    it('test_receiveCommand_throwsWithDescriptiveMessageForUnknownCommand', () => {
        const hub = new ExternalWorldHub();
        hub.registerCommandReceiver(['X.a'], new StubReceiver());

        expect(() => hub.receiveCommand('Y.z')).toThrow(
            /no receiver registered for command "Y\.z"/
        );
    });

    it('test_receiveCommand_errorMessageListsRegisteredCommands', () => {
        const hub = new ExternalWorldHub();
        hub.registerCommandReceiver(['A.x'], new StubReceiver());
        hub.registerCommandReceiver(['B.y'], new StubReceiver());

        expect(() => hub.receiveCommand('Z.unknown')).toThrow(/A\.x.*B\.y|B\.y.*A\.x/);
    });

    it('test_registerCommandReceiver_throwsOnDuplicateCommandName', () => {
        const hub = new ExternalWorldHub();
        hub.registerCommandReceiver(['X.a'], new StubReceiver());

        expect(() => hub.registerCommandReceiver(['X.a'], new StubReceiver())).toThrow(
            /command "X\.a" is already registered/
        );
    });

    it('test_registerCommandReceiver_throwsOnDuplicateInSameCall', () => {
        const hub = new ExternalWorldHub();
        hub.registerCommandReceiver(['X.a'], new StubReceiver());

        expect(() =>
            hub.registerCommandReceiver(['X.b', 'X.a'], new StubReceiver())
        ).toThrow(/command "X\.a" is already registered/);
    });
});

describe('ExternalWorldHub – registerSignalSender / connectTo', () => {

    it('test_connectTo_callsConnectSignalTargetOnAllSenders', () => {
        const sfsm = new Sfsm();
        const s1 = new StubSender();
        const s2 = new StubSender();

        new ExternalWorldHub()
            .registerSignalSender(['A.x'], s1)
            .registerSignalSender(['B.y'], s2)
            .connectTo(sfsm);

        expect(s1.target).toBe(sfsm);
        expect(s2.target).toBe(sfsm);
    });

    it('test_connectTo_setsHubAsCommandReceiverOnSfsm', () => {
        const sfsm = new Sfsm();
        const hub = new ExternalWorldHub()
            .registerCommandReceiver(['X.a'], new StubReceiver())
            .connectTo(sfsm);

        // Verify by loading a minimal FA and firing a command-triggering signal
        sfsm.loadFA({ 'Root': [['I', 's', 'E_1', 'X.a']] });

        // hub must be wired as command receiver — no throw expected
        expect(() => sfsm.receiveSignal('s')).not.toThrow();
    });

    it('test_connectTo_isFluentAndReturnsSameHub', () => {
        const sfsm = new Sfsm();
        const hub = new ExternalWorldHub();
        const result = hub.connectTo(sfsm);
        expect(result).toBe(hub);
    });
});

describe('ExternalWorldHub – diagnostic accessors', () => {

    it('test_getRegisteredCommands_returnsAllCommandNames', () => {
        const hub = new ExternalWorldHub();
        hub.registerCommandReceiver(['A.x', 'A.y'], new StubReceiver());
        hub.registerCommandReceiver(['B.z'], new StubReceiver());

        expect(hub.getRegisteredCommands().sort()).toEqual(['A.x', 'A.y', 'B.z']);
    });

    it('test_getRegisteredSignals_returnsAllSignalNames', () => {
        const hub = new ExternalWorldHub();
        hub.registerSignalSender(['X.a', 'X.b'], new StubSender());
        hub.registerSignalSender(['Y.c'], new StubSender());

        expect(hub.getRegisteredSignals().sort()).toEqual(['X.a', 'X.b', 'Y.c']);
    });

    it('test_getRegisteredCommands_returnsEmptyWhenNoneRegistered', () => {
        expect(new ExternalWorldHub().getRegisteredCommands()).toEqual([]);
    });

    it('test_getRegisteredSignals_returnsEmptyWhenNoneRegistered', () => {
        expect(new ExternalWorldHub().getRegisteredSignals()).toEqual([]);
    });
});

describe('ExternalWorldHub – fluent chain', () => {

    it('test_fluentChain_registerAndConnect_worksEndToEnd', () => {
        const sfsm = new Sfsm();
        const device = new StubSenderAndReceiver();

        new ExternalWorldHub()
            .registerSignalSender(['D.on', 'D.off'], device)
            .registerCommandReceiver(['D.cmd'], device)
            .connectTo(sfsm);

        // Signal target was wired
        expect(device.target).toBe(sfsm);

        // Command routing works
        const hub = new ExternalWorldHub()
            .registerCommandReceiver(['D.cmd'], device);
        hub.receiveCommand('D.cmd');
        expect(device.received).toEqual(['D.cmd']);
    });

    it('test_registerCommandReceiver_isFluentAndReturnsSameHub', () => {
        const hub = new ExternalWorldHub();
        const result = hub.registerCommandReceiver(['A.x'], new StubReceiver());
        expect(result).toBe(hub);
    });

    it('test_registerSignalSender_isFluentAndReturnsSameHub', () => {
        const hub = new ExternalWorldHub();
        const result = hub.registerSignalSender(['A.x'], new StubSender());
        expect(result).toBe(hub);
    });
});

describe('ExternalWorldHub – device implementing both interfaces', () => {

    it('test_dualRoleDevice_wireBothSidesCorrectly', () => {
        const sfsm = new Sfsm();
        const device = new StubSenderAndReceiver();

        const hub = new ExternalWorldHub()
            .registerSignalSender(['D.sig'], device)
            .registerCommandReceiver(['D.cmd'], device);

        hub.connectTo(sfsm);

        // Signal side wired
        expect(device.target).toBe(sfsm);

        // Command side routes
        hub.receiveCommand('D.cmd');
        expect(device.received).toContain('D.cmd');
    });
});
