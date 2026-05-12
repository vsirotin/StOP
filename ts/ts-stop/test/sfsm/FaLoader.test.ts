import * as path from 'path';
import { loadFAFromFile } from '../../src/sfsm';
import { Sfsm } from '../../src/sfsm';
import { TurnstileService } from './simulators/TurnstileService';
import { TurnstileDevice } from './simulators/TurnstileDevice';
import { CoinChecker } from './simulators/CoinChecker';
import { CoinAcceptor } from './simulators/CoinAcceptor';
import { Changer } from './simulators/Changer';
import { BanknoteChecker } from './simulators/BanknoteChecker';
import { BanknoteAcceptor } from './simulators/BanknoteAcceptor';
import { CommandRouter } from './simulators/CommandRouter';

const extendedPath = path.resolve(__dirname, 'test-data/turnstile-fa.json');
const compactPath  = path.resolve(__dirname, 'test-data/turnstile-fa-compact.json');

// ---------------------------------------------------------------------------
// loadFAFromFile – return value
// ---------------------------------------------------------------------------

describe('loadFAFromFile – return value', () => {
    it('should return an object for the extended FA file', () => {
        const fa = loadFAFromFile(extendedPath);
        expect(typeof fa).toBe('object');
        expect(fa).not.toBeNull();
    });

    it('should contain root key "TS" for the extended FA file', () => {
        const fa = loadFAFromFile(extendedPath);
        expect(Object.keys(fa)).toContain('TS');
    });

    it('should return an object for the compact FA file', () => {
        const fa = loadFAFromFile(compactPath);
        expect(typeof fa).toBe('object');
        expect(fa).not.toBeNull();
    });

    it('should contain keys TS, PP, BPP, CPP for the compact FA file', () => {
        const fa = loadFAFromFile(compactPath);
        expect(Object.keys(fa)).toContain('TS');
        expect(Object.keys(fa)).toContain('PP');
        expect(Object.keys(fa)).toContain('BPP');
        expect(Object.keys(fa)).toContain('CPP');
    });

    it('should throw when file does not exist', () => {
        expect(() => loadFAFromFile('/non/existent/file.json')).toThrow();
    });
});

// ---------------------------------------------------------------------------
// loadFAFromFile – integration with Sfsm (extended format)
// ---------------------------------------------------------------------------

describe('loadFAFromFile – Sfsm integration with extended FA', () => {
    it('should load and run extended FA from file: coin exact fare', () => {
        const sfsm = new Sfsm({ byMissingTransition: 'error', byMissingData: 'error' });
        const device = new TurnstileDevice();
        const coinChecker = new CoinChecker();
        const coinAcceptor = new CoinAcceptor(1);
        const changer = new Changer();
        const banknoteChecker = new BanknoteChecker();
        const banknoteAcceptor = new BanknoteAcceptor(1);

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
        sfsm.loadFA(loadFAFromFile(extendedPath));

        const service = new TurnstileService(sfsm);
        service.start();

        sfsm.receiveSignal('CR.cc$', { value: 1 });
        expect(sfsm.getHeadState()).toBe('U');
    });
});

// ---------------------------------------------------------------------------
// loadFAFromFile – integration with Sfsm (compact format)
// ---------------------------------------------------------------------------

describe('loadFAFromFile – Sfsm integration with compact FA', () => {
    it('should load and run compact FA from file: coin exact fare', () => {
        const sfsm = new Sfsm({ byMissingTransition: 'error', byMissingData: 'error' });
        const device = new TurnstileDevice();
        const coinChecker = new CoinChecker();
        const coinAcceptor = new CoinAcceptor(1);
        const changer = new Changer();
        const banknoteChecker = new BanknoteChecker();
        const banknoteAcceptor = new BanknoteAcceptor(1);

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
        sfsm.loadFA(loadFAFromFile(compactPath));

        const service = new TurnstileService(sfsm);
        service.start();

        sfsm.receiveSignal('CR.cc$', { value: 1 });
        expect(sfsm.getHeadState()).toBe('U');
    });
});
