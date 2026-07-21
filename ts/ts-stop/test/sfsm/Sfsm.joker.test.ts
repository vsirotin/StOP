import { Sfsm, FaDefinition } from '../../src/sfsm';

// ---------------------------------------------------------------------------
// Joker signal / joker state matching.
//
// - A joker-signal transition ([state, JOKER, toState]) matches any signal
//   while the FA is in `state`, but only if no exact transition for the
//   received signal exists in that state.
// - A joker-state transition ([JOKER, signal, toState]) matches `signal`
//   from any current state, but only if no exact transition for that state
//   exists for the received signal.
// - Exact, literal transitions always take priority over joker matches.
// ---------------------------------------------------------------------------

describe('SFSM – Joker signal (default "*")', () => {

    function loadFa(): Sfsm {
        const fa: FaDefinition = {
            Device: [
                ['I', 'start', 'running'],
                ['running', 'ping', 'running'],
                ['running', '*', 'off'] // joker-signal: any other signal while running -> off
            ]
        };
        const sfsm = new Sfsm();
        sfsm.loadFA(fa);
        sfsm.receiveSignal('start');
        return sfsm;
    }

    it('should follow the exact transition when the received signal is known', () => {
        const sfsm = loadFa();
        sfsm.receiveSignal('ping');
        expect(sfsm.getHeadState()).toBe('running');
    });

    it('should fall back to the joker-signal transition for an unrecognised signal', () => {
        const sfsm = loadFa();
        sfsm.receiveSignal('powerFailure');
        expect(sfsm.getHeadState()).toBe('off');
    });

    it('should still prefer the exact transition even though a joker-signal transition exists', () => {
        const sfsm = loadFa();
        sfsm.receiveSignal('ping');
        sfsm.receiveSignal('ping');
        expect(sfsm.getHeadState()).toBe('running');
    });

    it('should send the command attached to a joker-signal transition', () => {
        const received: Array<{ command: string; data: unknown }> = [];
        const fa: FaDefinition = {
            Device: [
                ['I', 'start', 'running'],
                ['running', '*', 'off', 'DEV.shutdown']
            ]
        };
        const sfsm = new Sfsm();
        sfsm.setCommandReceiver({
            receiveCommand: (command, data) => received.push({ command, data })
        });
        sfsm.loadFA(fa);
        sfsm.receiveSignal('start');
        sfsm.receiveSignal('anySignal');

        expect(sfsm.getHeadState()).toBe('off');
        expect(received).toEqual([{ command: 'DEV.shutdown', data: undefined }]);
    });
});

describe('SFSM – Joker state (default "*")', () => {

    function loadFa(): Sfsm {
        const fa: FaDefinition = {
            Device: [
                ['I', 'start', 'idle'],
                ['idle', 'work', 'busy'],
                ['idle', 'service', 'maintenance'],
                ['*', 'service', 'maintenance'] // joker-state: "service" always -> maintenance
            ]
        };
        const sfsm = new Sfsm();
        sfsm.loadFA(fa);
        sfsm.receiveSignal('start');
        return sfsm;
    }

    it('should follow the exact from-state transition when one exists for the signal', () => {
        const sfsm = loadFa();
        sfsm.receiveSignal('service');
        expect(sfsm.getHeadState()).toBe('maintenance');
    });

    it('should fall back to the joker-state transition from a state with no exact match', () => {
        const sfsm = loadFa();
        sfsm.receiveSignal('work');
        expect(sfsm.getHeadState()).toBe('busy');

        sfsm.receiveSignal('service');
        expect(sfsm.getHeadState()).toBe('maintenance');
    });

    it('should prefer an exact from-state transition over the joker-state one', () => {
        const fa: FaDefinition = {
            Device: [
                ['I', 'start', 'idle'],
                ['idle', 'service', 'specialMaintenance'],
                ['*', 'service', 'maintenance']
            ]
        };
        const sfsm = new Sfsm();
        sfsm.loadFA(fa);
        sfsm.receiveSignal('start');
        sfsm.receiveSignal('service');
        expect(sfsm.getHeadState()).toBe('specialMaintenance');
    });
});

describe('SFSM – custom joker symbols via SfsmOptions', () => {

    it('should use a configured jokerSignal instead of "*"', () => {
        const fa: FaDefinition = {
            Device: [
                ['I', 'start', 'running'],
                ['running', 'ping', 'running'],
                ['running', 'ANY_SIGNAL', 'off']
            ]
        };
        const sfsm = new Sfsm({ jokerSignal: 'ANY_SIGNAL' });
        sfsm.loadFA(fa);
        sfsm.receiveSignal('start');

        sfsm.receiveSignal('unknownSignal');
        expect(sfsm.getHeadState()).toBe('off');
    });

    it('should use a configured jokerState instead of "*"', () => {
        const fa: FaDefinition = {
            Device: [
                ['I', 'start', 'idle'],
                ['idle', 'work', 'busy'],
                ['ANY_STATE', 'service', 'maintenance']
            ]
        };
        const sfsm = new Sfsm({ jokerState: 'ANY_STATE' });
        sfsm.loadFA(fa);
        sfsm.receiveSignal('start');

        sfsm.receiveSignal('work');
        expect(sfsm.getHeadState()).toBe('busy');

        sfsm.receiveSignal('service');
        expect(sfsm.getHeadState()).toBe('maintenance');
    });

    it('should not treat "*" specially when a different jokerSignal is configured', () => {
        const fa: FaDefinition = {
            Device: [
                ['I', 'start', 'running'],
                ['running', '*', 'literalStarState']
            ]
        };
        const sfsm = new Sfsm({ jokerSignal: 'ANY_SIGNAL' });
        sfsm.loadFA(fa);
        sfsm.receiveSignal('start');
        sfsm.receiveSignal('*');
        expect(sfsm.getHeadState()).toBe('literalStarState');
    });
});
