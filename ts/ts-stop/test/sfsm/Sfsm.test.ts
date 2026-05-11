import * as path from 'path';
import * as fs from 'fs';
import { Sfsm, FaDefinition } from '../../src/sfsm';
import { TurnstileService } from './simulators/TurnstileService';
import { TurnstileDevice } from './simulators/TurnstileDevice';
import { CoinChecker } from './simulators/CoinChecker';
import { CoinAcceptor } from './simulators/CoinAcceptor';
import { Changer } from './simulators/Changer';
import { BanknoteChecker } from './simulators/BanknoteChecker';
import { BanknoteAcceptor } from './simulators/BanknoteAcceptor';
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
    banknoteChecker: BanknoteChecker;
    banknoteAcceptor: BanknoteAcceptor;
}

function buildHarness(fare = 1): Harness {
    const sfsm = new Sfsm({ byMissingTransition: 'error', byMissingData: 'error' });

    const device = new TurnstileDevice();
    const coinChecker = new CoinChecker();
    const coinAcceptor = new CoinAcceptor(fare);
    const changer = new Changer();
    const banknoteChecker = new BanknoteChecker();
    const banknoteAcceptor = new BanknoteAcceptor(fare);

    device.connectSfsm(sfsm);
    coinChecker.connectSfsm(sfsm);
    coinAcceptor.connectSfsm(sfsm);
    changer.connectSfsm(sfsm);
    banknoteChecker.connectSfsm(sfsm);
    banknoteAcceptor.connectSfsm(sfsm);

    const router = new CommandRouter();
    router.register('TS', device);
    router.register('CC', coinChecker);
    router.register('CA', coinAcceptor);
    router.register('CH', changer);
    router.register('BC', banknoteChecker);
    router.register('BA', banknoteAcceptor);

    sfsm.setCommandReceiver(router);
    sfsm.loadFA(loadTurnstileFa());

    const service = new TurnstileService(sfsm);

    return { sfsm, service, device, coinChecker, coinAcceptor, changer, banknoteChecker, banknoteAcceptor };
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

describe('SFSM – Turnstile: banknote (value=1, no change)', () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);   // fare = 1
        h.service.start();
    });

    it('should unlock turnstile after exact-fare banknote inserted', () => {
        h.sfsm.receiveSignal('BR.bc$', { value: 1 });
        expect(h.sfsm.getHeadState()).toBe('U');
    });

    it('should issue TS.ut command when banknote is valid', () => {
        h.sfsm.receiveSignal('BR.bc$', { value: 1 });
        expect(h.device.getCommandsReceived()).toContain('TS.ut');
    });

    it('should lock turnstile after person passes following banknote payment', () => {
        h.sfsm.receiveSignal('BR.bc$', { value: 1 });
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe('L');
    });

    it('should issue TS.l after passage following banknote payment', () => {
        h.sfsm.receiveSignal('BR.bc$', { value: 1 });
        h.device.triggerPassage();
        expect(h.device.getCommandsReceived()).toContain('TS.l');
    });
});

describe('SFSM – Turnstile: banknote (value=10, fare=5, change=5)', () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(5);   // fare = 5, banknote = 10 → change = 5
        h.service.start();
    });

    it('should unlock turnstile after banknote with change inserted', () => {
        h.sfsm.receiveSignal('BR.bc$', { value: 10 });
        expect(h.sfsm.getHeadState()).toBe('U');
    });

    it('should dispense correct change amount via Changer', () => {
        h.sfsm.receiveSignal('BR.bc$', { value: 10 });
        expect(h.changer.getLastChangeAmount()).toBe(5);
    });

    it('should issue TS.ut after change is dispensed for banknote', () => {
        h.sfsm.receiveSignal('BR.bc$', { value: 10 });
        expect(h.device.getCommandsReceived()).toContain('TS.ut');
    });

    it('should lock turnstile after person passes following banknote-with-change', () => {
        h.sfsm.receiveSignal('BR.bc$', { value: 10 });
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe('L');
    });
});

describe('SFSM – Turnstile: rejected banknote', () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);
        h.banknoteChecker.setRejectOnNext(true);
        h.service.start();
    });

    it('should be in PP:RE state while rejection is in progress', () => {
        h.sfsm.receiveSignal('BR.bc$', { value: 1 });
        expect(h.sfsm.getCurrentStack()).toEqual(['TS', 'PP']);
        expect(h.sfsm.getHeadState()).toBe('RE');
    });

    it('should lock turnstile after rejector signals RE.d', () => {
        h.sfsm.receiveSignal('BR.bc$', { value: 1 });
        h.sfsm.receiveSignal('RE.d');
        expect(h.sfsm.getHeadState()).toBe('L');
    });

    it('should issue TS.l command after banknote rejection completes', () => {
        h.sfsm.receiveSignal('BR.bc$', { value: 1 });
        h.sfsm.receiveSignal('RE.d');
        expect(h.device.getCommandsReceived()).toContain('TS.l');
    });
});

describe('SFSM – Turnstile: sequential transactions', () => {
    let h: Harness;

    beforeEach(() => {
        h = buildHarness(1);
        h.service.start();
    });

    it('should handle two successive coin payments correctly', () => {
        // First transaction
        h.sfsm.receiveSignal('CR.cc$', { value: 1 });
        expect(h.sfsm.getHeadState()).toBe('U');
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe('L');

        // Second transaction — device must reset for next test
        h.device.reset();
        h.sfsm.receiveSignal('CR.cc$', { value: 1 });
        expect(h.sfsm.getHeadState()).toBe('U');
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe('L');
    });

    it('should handle coin payment followed by banknote payment', () => {
        h.sfsm.receiveSignal('CR.cc$', { value: 1 });
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe('L');

        h.device.reset();
        h.sfsm.receiveSignal('BR.bc$', { value: 1 });
        expect(h.sfsm.getHeadState()).toBe('U');
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe('L');
    });
});
