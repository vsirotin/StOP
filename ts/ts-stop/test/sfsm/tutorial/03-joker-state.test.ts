import { Sfsm, FaDefinition } from '../../../src/sfsm';

// ---------------------------------------------------------------------------
// The joker-state turnstile FA from docs/Tutorial/Tutorial.md,
// "3.2 Joker state: a universal signal for technical personnel".
// Kept identical to the tutorial so readers can copy-paste-verify.
// ---------------------------------------------------------------------------

const turnstileWithJokerStateFa: FaDefinition = {
    Turnstile: [
        ['I', 'start', 'locked'],
        ['locked', 'coin', 'unlocked'],
        ['unlocked', 'push', 'locked'],
        ['*', 'service', 'maintenance']
    ]
};

function buildSfsm(): Sfsm {
    const sfsm = new Sfsm();
    sfsm.loadFA(turnstileWithJokerStateFa);
    return sfsm;
}

describe('Tutorial – Joker state (turnstile maintenance mode)', () => {
    it('should reach maintenance from "locked"', () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal('start');
        expect(sfsm.getHeadState()).toBe('locked');

        sfsm.receiveSignal('service');
        expect(sfsm.getHeadState()).toBe('maintenance');
    });

    it('should reach maintenance from "unlocked" just as easily', () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal('start');
        sfsm.receiveSignal('coin');
        expect(sfsm.getHeadState()).toBe('unlocked');

        sfsm.receiveSignal('service');
        expect(sfsm.getHeadState()).toBe('maintenance');
    });

    it('should still behave normally for coin/push when service is never sent', () => {
        const sfsm = buildSfsm();
        sfsm.receiveSignal('start');
        sfsm.receiveSignal('coin');
        sfsm.receiveSignal('push');
        expect(sfsm.getHeadState()).toBe('locked');
    });
});
