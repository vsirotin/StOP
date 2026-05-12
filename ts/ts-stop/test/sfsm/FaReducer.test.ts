import * as path from 'path';
import * as fs from 'fs';
import { FaDefinition, Transition } from '../../src/sfsm';
import { reduceFA } from '../../src/sfsm';
import { Sfsm, ExternalWorldHub } from '../../src/sfsm';
import { TurnstileService } from './simulators/TurnstileService';
import { TurnstileDevice } from './simulators/TurnstileDevice';
import { CoinChecker } from './simulators/CoinChecker';
import { CoinAcceptor } from './simulators/CoinAcceptor';
import { Changer } from './simulators/Changer';
import { BanknoteChecker } from './simulators/BanknoteChecker';
import { BanknoteAcceptor } from './simulators/BanknoteAcceptor';

function loadExtendedFa(): FaDefinition {
    const p = path.resolve(__dirname, 'test-data/turnstile-fa.json');
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as FaDefinition;
}

function loadCompactFa(): FaDefinition {
    const p = path.resolve(__dirname, 'test-data/turnstile-fa-compact.json');
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as FaDefinition;
}

// ---------------------------------------------------------------------------
// reduceFA – output shape
// ---------------------------------------------------------------------------

describe('reduceFA – output shape', () => {
    let reduced: FaDefinition;

    beforeAll(() => {
        reduced = reduceFA(loadExtendedFa());
    });

    it('should return an object', () => {
        expect(typeof reduced).toBe('object');
        expect(reduced).not.toBeNull();
    });

    it('all values in the output should be Transition arrays', () => {
        for (const [key, value] of Object.entries(reduced)) {
            expect(Array.isArray(value)).toBe(true); // key: ${key}
        }
    });

    it('should contain all FA names: TS, PP, BPP, CPP', () => {
        expect(Object.keys(reduced)).toContain('TS');
        expect(Object.keys(reduced)).toContain('PP');
        expect(Object.keys(reduced)).toContain('BPP');
        expect(Object.keys(reduced)).toContain('CPP');
    });

    it('TS transitions should match original ts array', () => {
        const tsTransitions = reduced['TS'] as Transition[];
        expect(tsTransitions).toEqual([
            ['I', 'TS.s', 'L'],
            ['L', 'BR.bc$', 'PP'],
            ['L', 'CR.cc$', 'PP'],
            ['PP', 'BA.n', 'U', 'TS.ut'],
            ['PP', 'CA.n', 'U', 'TS.ut'],
            ['PP', 'CH.d', 'U', 'TS.ut'],
            ['PP', 'RE.d', 'L', 'TS.l'],
            ['U', 'TS.to', 'L', 'TS.l'],
            ['U', 'TS.ps', 'L', 'TS.l']
        ]);
    });

    it('BPP transitions should match original ts array', () => {
        const bppTransitions = reduced['BPP'] as Transition[];
        expect(bppTransitions).toEqual([
            ['I', 'BR.bc$', 'C', 'BC.c$'],
            ['C', 'BC.p$', 'A', 'BA.a$'],
            ['C', 'BC.r$', 'E_R'],
            ['A', 'BA.c$', 'E_C'],
            ['A', 'BA.n', 'E_N']
        ]);
    });

    it('CPP transitions should match original ts array', () => {
        const cppTransitions = reduced['CPP'] as Transition[];
        expect(cppTransitions).toEqual([
            ['I', 'CR.cc$', 'CW', 'CC.cw$'],
            ['CW', 'CC.p$', 'CF', 'CC.cf$'],
            ['CF', 'CC.p$', 'A', 'CA.a$'],
            ['CW', 'CC.r$', 'E_R'],
            ['CF', 'CC.r$', 'E_R'],
            ['A', 'CA.c$', 'E_C'],
            ['A', 'CA.n', 'E_N']
        ]);
    });
});

// ---------------------------------------------------------------------------
// reduceFA – already-compact input
// ---------------------------------------------------------------------------

describe('reduceFA – already-compact input is returned unchanged', () => {
    it('should return the same structure for compact input', () => {
        const compact = loadCompactFa();
        const result = reduceFA(compact);
        expect(result).toEqual(compact);
    });
});

// ---------------------------------------------------------------------------
// reduceFA – single-level FA (BPP-like)
// ---------------------------------------------------------------------------

describe('reduceFA – single-level extended FA', () => {
    it('should reduce a single-level extended FA correctly', () => {
        const singleFa: FaDefinition = {
            'BPP': {
                ts: [
                    ['I', 'BR.bc$', 'C', 'BC.c$'],
                    ['C', 'BC.p$', 'A', 'BA.a$'],
                    ['C', 'BC.r$', 'E_R'],
                    ['A', 'BA.c$', 'E_C'],
                    ['A', 'BA.n', 'E_N']
                ]
            }
        };

        const result = reduceFA(singleFa);
        expect(Object.keys(result)).toEqual(['BPP']);
        expect(Array.isArray(result['BPP'])).toBe(true);
        expect(result['BPP']).toEqual((singleFa['BPP'] as import('../../src/sfsm').FaNode).ts);
    });
});

// ---------------------------------------------------------------------------
// reduceFA – round-trip
// ---------------------------------------------------------------------------

describe('reduceFA – round-trip: reduce then load produces same behaviour', () => {
    function buildHarness(fare: number, definition: FaDefinition) {
        const sfsm = new Sfsm({ byMissingTransition: 'error', byMissingData: 'error' });
        const device = new TurnstileDevice();
        const coinChecker = new CoinChecker();
        const coinAcceptor = new CoinAcceptor(fare);
        const changer = new Changer();
        const banknoteChecker = new BanknoteChecker();
        const banknoteAcceptor = new BanknoteAcceptor(fare);

        const service = new TurnstileService();

        new ExternalWorldHub()
            .registerSignalSender(['TS.s'], service)
            .registerSignalSender(['TS.to', 'TS.ps'], device)
            .registerCommandReceiver(['TS.ut', 'TS.l'], device)
            .registerSignalSender(['CC.p$', 'CC.r$'], coinChecker)
            .registerCommandReceiver(['CC.cw$', 'CC.cf$'], coinChecker)
            .registerSignalSender(['CA.c$', 'CA.n'], coinAcceptor)
            .registerCommandReceiver(['CA.a$'], coinAcceptor)
            .registerSignalSender(['CH.d'], changer)
            .registerCommandReceiver(['CH.c$'], changer)
            .registerSignalSender(['BC.p$', 'BC.r$'], banknoteChecker)
            .registerCommandReceiver(['BC.c$'], banknoteChecker)
            .registerSignalSender(['BA.c$', 'BA.n'], banknoteAcceptor)
            .registerCommandReceiver(['BA.a$'], banknoteAcceptor)
            .connectTo(sfsm);

        sfsm.loadFA(definition);
        return { sfsm, service, device, changer };
    }

    it('coin exact fare: reduced FA reaches U then L after passage', () => {
        const reduced = reduceFA(loadExtendedFa());
        const h = buildHarness(1, reduced);
        h.service.start();
        h.sfsm.receiveSignal('CR.cc$', { value: 1 });
        expect(h.sfsm.getHeadState()).toBe('U');
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe('L');
    });

    it('coin with change: reduced FA dispenses correct change and reaches U', () => {
        const reduced = reduceFA(loadExtendedFa());
        const h = buildHarness(1, reduced);
        h.service.start();
        h.sfsm.receiveSignal('CR.cc$', { value: 2 });
        expect(h.changer.getLastChangeAmount()).toBe(1);
        expect(h.sfsm.getHeadState()).toBe('U');
    });

    it('banknote exact fare: reduced FA reaches U then L after passage', () => {
        const reduced = reduceFA(loadExtendedFa());
        const h = buildHarness(1, reduced);
        h.service.start();
        h.sfsm.receiveSignal('BR.bc$', { value: 1 });
        expect(h.sfsm.getHeadState()).toBe('U');
        h.device.triggerPassage();
        expect(h.sfsm.getHeadState()).toBe('L');
    });

    it('reduced FA log entry has no metadata name fields', () => {
        const reduced = reduceFA(loadExtendedFa());
        const h = buildHarness(1, reduced);
        h.service.start();
        const log = h.sfsm.getLog();
        expect(log[0].stateName).toBeUndefined();
        expect(log[0].signalName).toBeUndefined();
    });
});
