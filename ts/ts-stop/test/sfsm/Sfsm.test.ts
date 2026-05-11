import * as path from 'path';
import * as fs from 'fs';
import { Sfsm, FaDefinition } from '../../src/sfsm';
import { TurnstileService } from './simulators/TurnstileService';
import { TurnstileDevice } from './simulators/TurnstileDevice';
import { CoinChecker } from './simulators/CoinChecker';
import { CoinAcceptor } from './simulators/CoinAcceptor';
import { Changer } from './simulators/Changer';
import { CommandRouter } from './simulators/CommandRouter';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadTurnstileFa(): FaDefinition {
    const p = path.resolve(__dirname, 'test-data/turnstile-fa.json');
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as FaDefinition;
}

interface Harness {
    sfsm: Sfsm;
    service: TurnstileService;
    device: TurnstileDevice;
    coinChecker: CoinChecker;
    coinAcceptor: CoinAcceptor;
    changer: Changer;
}

function buildHarness(fare = 1): Harness {
    const sfsm = new Sfsm({ byMissingTransition: 'error', byMissingData: 'error' });

    const device = new TurnstileDevice();
    const coinChecker = new CoinChecker();
    const coinAcceptor = new CoinAcceptor(fare);
    const changer = new Changer();

    device.connectSfsm(sfsm);
    coinChecker.connectSfsm(sfsm);
    coinAcceptor.connectSfsm(sfsm);
    changer.connectSfsm(sfsm);

    const router = new CommandRouter();
    router.register('TS', device);
    router.register('CC', coinChecker);
    router.register('CA', coinAcceptor);
    router.register('CH', changer);

    sfsm.setCommandReceiver(router);
    sfsm.loadFA(loadTurnstileFa());

    const service = new TurnstileService(sfsm);

    return { sfsm, service, device, coinChecker, coinAcceptor, changer };
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('SFSM – Initialisation', () => {
    it('should be in state I after loadFA', () => {
        const { sfsm } = buildHarness();
        expect(sfsm.getHeadState()).toBe('I');
    });

    it('should transition to Locked (L) after TS.s', () => {
        const { sfsm, service } = buildHarness();
        service.start();
        expect(sfsm.getHeadState()).toBe('L');
    });
});

describe('SFSM – Turnstile: coin (value=1, no change)', () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);   // fare = 1
        h.service.start();     // I → L
    });

    it('should unlock turnstile after exact-fare coin inserted', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 1 });
        expect(h.sfsm.getHeadState()).toBe('U');
    });

    it('should issue TS.ut command when coin is valid', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 1 });
        expect(h.device.getCommandsReceived()).toContain('TS.ut');
    });

    it('should lock turnstile after person passes', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 1 });
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe('L');
    });

    it('should issue TS.l command after passage', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 1 });
        h.device.triggerPassage();
        expect(h.device.getCommandsReceived()).toContain('TS.l');
    });

    it('should lock turnstile on timeout', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 1 });
        h.device.triggerTimeout();
        expect(h.sfsm.getHeadState()).toBe('L');
    });
});

describe('SFSM – Turnstile: coin (value=2, change=1)', () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);   // fare = 1, coin = 2 → change = 1
        h.service.start();
    });

    it('should unlock turnstile after coin with change inserted', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 2 });
        expect(h.sfsm.getHeadState()).toBe('U');
    });

    it('should issue CH.c$ command to Changer for change', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 2 });
        // Changer received the make-change command (fired from PP → CH state)
        expect(h.changer.getLastChangeAmount()).toBe(1);
    });

    it('should issue TS.ut after change is dispensed', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 2 });
        expect(h.device.getCommandsReceived()).toContain('TS.ut');
    });

    it('should lock turnstile after person passes following coin-with-change', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 2 });
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe('L');
    });
});

describe('SFSM – Turnstile: rejected coin', () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);
        h.coinChecker.setRejectOnNext(true);
        h.service.start();
    });

    it('should be in PP:RE state while rejection is in progress', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 1 });
        // SFSM is waiting in PP:RE for the physical rejector to finish
        expect(h.sfsm.getCurrentStack()).toEqual(['TS', 'PP']);
        expect(h.sfsm.getHeadState()).toBe('RE');
    });

    it('should lock turnstile after rejector signals RE.d', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 1 });
        h.sfsm.receiveSignal('RE.d');   // simulate rejector finishing
        expect(h.sfsm.getHeadState()).toBe('L');
    });

    it('should issue TS.l command after RE.d completes rejection', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 1 });
        h.sfsm.receiveSignal('RE.d');
        expect(h.device.getCommandsReceived()).toContain('TS.l');
    });
});
