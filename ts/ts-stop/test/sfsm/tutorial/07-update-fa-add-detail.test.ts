import { Sfsm, FaDefinition, FaUpdate, updateCompactFA } from '../../../src/sfsm';

// ---------------------------------------------------------------------------
// The "state becomes a sub-FA" update example from docs/Tutorial/Tutorial.md,
// "7. Utilities" — updateCompactFA section.
//
// BEFORE: "coin" unlocks the turnstile immediately — no validation at all.
// AFTER (via updateCompactFA): "coin" now routes through a small CoinCheck
// sub-FA that only unlocks the turnstile once the coin has been validated.
// The turnstile's own behaviour becomes more detailed without anyone having
// to hand-edit its transition list — the update just adds a new FA and
// replaces the root's transitions.
// ---------------------------------------------------------------------------

const simpleTurnstileFa: FaDefinition = {
    Turnstile: [
        ['I', 'start', 'locked'],
        ['locked', 'coin', 'unlocked'],
        ['unlocked', 'push', 'locked']
    ]
};

const addCoinValidationUpdate: FaUpdate = {
    add: {
        Turnstile: [
            ['I', 'start', 'locked'],
            ['locked', 'coin', 'CoinCheck'],
            ['CoinCheck', 'CC.ok', 'unlocked'],
            ['CoinCheck', 'CC.bad', 'locked'],
            ['unlocked', 'push', 'locked']
        ],
        CoinCheck: [
            ['I', 'coin', 'checking'],
            ['checking', 'CC.ok', 'E_ok'],
            ['checking', 'CC.bad', 'E_bad']
        ]
    }
};

describe('Tutorial – Utilities: promoting a leaf state to a sub-FA via updateCompactFA', () => {
    it('should unlock immediately on "coin" before the update (no validation)', () => {
        const sfsm = new Sfsm();
        sfsm.loadFA(simpleTurnstileFa);
        sfsm.receiveSignal('start');
        sfsm.receiveSignal('coin');
        expect(sfsm.getHeadState()).toBe('unlocked');
    });

    it('should route "coin" through CoinCheck after the update, unlocking only on CC.ok', () => {
        const updatedFa = updateCompactFA(simpleTurnstileFa, addCoinValidationUpdate);

        const sfsm = new Sfsm();
        sfsm.loadFA(updatedFa);
        sfsm.receiveSignal('start');
        sfsm.receiveSignal('coin');

        // Still inside CoinCheck, waiting for the checker's verdict
        expect(sfsm.getCurrentStack()).toEqual(['Turnstile', 'CoinCheck']);

        sfsm.receiveSignal('CC.ok');
        expect(sfsm.getCurrentStack()).toEqual(['Turnstile']);
        expect(sfsm.getHeadState()).toBe('unlocked');
    });

    it('should stay locked after the update when the checker rejects the coin', () => {
        const updatedFa = updateCompactFA(simpleTurnstileFa, addCoinValidationUpdate);

        const sfsm = new Sfsm();
        sfsm.loadFA(updatedFa);
        sfsm.receiveSignal('start');
        sfsm.receiveSignal('coin');
        sfsm.receiveSignal('CC.bad');

        expect(sfsm.getCurrentStack()).toEqual(['Turnstile']);
        expect(sfsm.getHeadState()).toBe('locked');
    });

    it('should not mutate the original (pre-update) FA definition', () => {
        const before = JSON.parse(JSON.stringify(simpleTurnstileFa));
        updateCompactFA(simpleTurnstileFa, addCoinValidationUpdate);
        expect(simpleTurnstileFa).toEqual(before);
    });
});
