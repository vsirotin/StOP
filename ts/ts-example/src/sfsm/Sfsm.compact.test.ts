/**
 * @jest-environment node
 *
 * Tests for the Sfsm engine operating on a compact FA definition as loaded
 * from the installed @vsirotin/ts-stop package.
 *
 * Physical-device simulators are intentionally not used here — all signals
 * are sent directly through the SFSM API. Command receivers are implemented
 * as minimal inline stubs that capture received commands and — where needed —
 * fire back the expected response signal so the state machine can complete
 * its transitions.
 */

import * as path from 'path';
import * as fs from 'fs';
import {
    Sfsm,
    FaDefinition,
    ICommandReceiver,
    ISignalReceiver,
    ISignalSender,
    ExternalWorldHub
} from '@vsirotin/ts-stop/sfsm';

const testDataDir = path.resolve(__dirname, '../../../ts-stop/test/sfsm/test-data');

function loadCompactFa(): FaDefinition {
    return JSON.parse(
        fs.readFileSync(path.join(testDataDir, 'turnstile-fa-compact.json'), 'utf-8')
    ) as FaDefinition;
}

// ---------------------------------------------------------------------------
// Minimal inline stubs
// ---------------------------------------------------------------------------

/** Records every command it receives. */
class RecordingReceiver implements ICommandReceiver {
    readonly commands: string[] = [];
    receiveCommand(command: string): void {
        this.commands.push(command);
    }
}

/**
 * Stub that auto-responds to commands with a pre-configured signal,
 * driving the SFSM forward without a full simulator.
 */
class AutoResponder implements ICommandReceiver, ISignalSender {
    private sfsm: ISignalReceiver | null = null;
    private readonly responses: Map<string, [string, unknown?]>;

    constructor(responses: Record<string, [string, unknown?]>) {
        this.responses = new Map(Object.entries(responses));
    }

    connectSignalTarget(target: ISignalReceiver): void {
        this.sfsm = target;
    }

    receiveCommand(command: string, data?: unknown): void {
        const response = this.responses.get(command);
        if (response) {
            this.sfsm!.receiveSignal(response[0], response[1]);
        }
    }
}

// ---------------------------------------------------------------------------
// SFSM compact – Initialisation
// ---------------------------------------------------------------------------

describe('SFSM compact – Initialisation', () => {
    it('initial state should be I after loadFA', () => {
        const sfsm = new Sfsm({ byMissingTransition: 'ignore' });
        sfsm.loadFA(loadCompactFa());
        expect(sfsm.getHeadState()).toBe('I');
    });

    it('initial stack should contain root FA TS', () => {
        const sfsm = new Sfsm({ byMissingTransition: 'ignore' });
        sfsm.loadFA(loadCompactFa());
        expect(sfsm.getCurrentStack()).toEqual(['TS']);
    });

    it('should transition to Locked (L) after TS.s', () => {
        const sfsm = new Sfsm({ byMissingTransition: 'ignore' });
        sfsm.loadFA(loadCompactFa());
        sfsm.receiveSignal('TS.s');
        expect(sfsm.getHeadState()).toBe('L');
    });
});

// ---------------------------------------------------------------------------
// SFSM compact – Banknote payment (rejected banknote)
// ---------------------------------------------------------------------------

describe('SFSM compact – banknote rejected', () => {
    function buildSfsm() {
        const sfsm = new Sfsm({ byMissingTransition: 'error', byMissingData: 'error' });
        const recorder = new RecordingReceiver();

        // BC.c$ → BC.r$ (reject the banknote)
        const banknoteChecker = new AutoResponder({ 'BC.c$': ['BC.r$'] });

        new ExternalWorldHub()
            .registerCommandReceiver(['TS.ut', 'TS.l'], recorder)
            .registerCommandReceiver(['BC.c$'], banknoteChecker)
            .registerSignalSender(['BC.r$', 'BC.p$'], banknoteChecker)
            .connectTo(sfsm);

        sfsm.loadFA(loadCompactFa());
        sfsm.receiveSignal('TS.s');  // I → L
        return { sfsm, recorder };
    }

    it('should be in PP:RE state while rejection is in progress', () => {
        const { sfsm } = buildSfsm();
        sfsm.receiveSignal('BR.bc$', { value: 1 });
        expect(sfsm.getCurrentStack()).toEqual(['TS', 'PP']);
        expect(sfsm.getHeadState()).toBe('RE');
    });

    it('should lock turnstile (L) after RE.d completes the rejection', () => {
        const { sfsm } = buildSfsm();
        sfsm.receiveSignal('BR.bc$', { value: 1 });
        sfsm.receiveSignal('RE.d');
        expect(sfsm.getHeadState()).toBe('L');
    });

    it('should issue TS.l command after RE.d completes rejection', () => {
        const { sfsm, recorder } = buildSfsm();
        sfsm.receiveSignal('BR.bc$', { value: 1 });
        sfsm.receiveSignal('RE.d');
        expect(recorder.commands).toContain('TS.l');
    });

    it('stack should be back to [TS] after rejection completes', () => {
        const { sfsm } = buildSfsm();
        sfsm.receiveSignal('BR.bc$', { value: 1 });
        sfsm.receiveSignal('RE.d');
        expect(sfsm.getCurrentStack()).toEqual(['TS']);
    });
});

// ---------------------------------------------------------------------------
// SFSM compact – Coin payment (rejected coin)
// ---------------------------------------------------------------------------

describe('SFSM compact – coin rejected', () => {
    function buildSfsm() {
        const sfsm = new Sfsm({ byMissingTransition: 'error', byMissingData: 'error' });
        const recorder = new RecordingReceiver();

        // CC.cw$ → CC.r$ (reject at weight check)
        const coinChecker = new AutoResponder({ 'CC.cw$': ['CC.r$'] });

        new ExternalWorldHub()
            .registerCommandReceiver(['TS.ut', 'TS.l'], recorder)
            .registerCommandReceiver(['CC.cw$', 'CC.cf$'], coinChecker)
            .registerSignalSender(['CC.r$', 'CC.p$'], coinChecker)
            .connectTo(sfsm);

        sfsm.loadFA(loadCompactFa());
        sfsm.receiveSignal('TS.s');  // I → L
        return { sfsm, recorder };
    }

    it('should be in PP:RE state while rejection is in progress', () => {
        const { sfsm } = buildSfsm();
        sfsm.receiveSignal('CR.cc$', { value: 1 });
        expect(sfsm.getCurrentStack()).toEqual(['TS', 'PP']);
        expect(sfsm.getHeadState()).toBe('RE');
    });

    it('should lock turnstile (L) after RE.d completes the rejection', () => {
        const { sfsm } = buildSfsm();
        sfsm.receiveSignal('CR.cc$', { value: 1 });
        sfsm.receiveSignal('RE.d');
        expect(sfsm.getHeadState()).toBe('L');
    });

    it('stack should be back to [TS] after rejection completes', () => {
        const { sfsm } = buildSfsm();
        sfsm.receiveSignal('CR.cc$', { value: 1 });
        sfsm.receiveSignal('RE.d');
        expect(sfsm.getCurrentStack()).toEqual(['TS']);
    });
});

// ---------------------------------------------------------------------------
// SFSM compact – Log
// ---------------------------------------------------------------------------

describe('SFSM compact – Log', () => {
    it('getLog() should return an array', () => {
        const sfsm = new Sfsm({ byMissingTransition: 'ignore' });
        sfsm.loadFA(loadCompactFa());
        sfsm.receiveSignal('TS.s');
        expect(Array.isArray(sfsm.getLog())).toBe(true);
    });

    it('log should have at least one entry after TS.s', () => {
        const sfsm = new Sfsm({ byMissingTransition: 'ignore' });
        sfsm.loadFA(loadCompactFa());
        sfsm.receiveSignal('TS.s');
        expect(sfsm.getLog().length).toBeGreaterThan(0);
    });
});
