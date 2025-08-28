import { TurnstileBase } from './TurnstileBase';

describe('Turnstile', () => {
    let turnstile: TurnstileBase;

    beforeEach(() => {
        turnstile = new TurnstileBase();
    });

    describe('constructor', () => {
        it('should initialize in locked state', () => {
            expect(turnstile.getCurrentState()).toBe('locked');
        });

        it('should be locked initially', () => {
            expect(turnstile.isLocked()).toBe(true);
            expect(turnstile.isUnlocked()).toBe(false);
        });
    });

    describe('insertCoin', () => {
        it('should unlock turnstile when locked', () => {
            // Arrange: turnstile starts locked
            expect(turnstile.getCurrentState()).toBe('locked');

            // Act: insert coin
            const resultState = turnstile.insertCoin();

            // Assert: should be unlocked
            expect(resultState).toBe('unlocked');
            expect(turnstile.getCurrentState()).toBe('unlocked');
            expect(turnstile.isUnlocked()).toBe(true);
            expect(turnstile.isLocked()).toBe(false);
        });

        it('should remain unlocked when already unlocked', () => {
            // Arrange: unlock the turnstile first
            turnstile.insertCoin();
            expect(turnstile.getCurrentState()).toBe('unlocked');

            // Act: insert another coin
            const resultState = turnstile.insertCoin();

            // Assert: should remain unlocked
            expect(resultState).toBe('unlocked');
            expect(turnstile.getCurrentState()).toBe('unlocked');
            expect(turnstile.isUnlocked()).toBe(true);
        });
    });

    describe('pushThrough', () => {
        it('should lock turnstile when unlocked', () => {
            // Arrange: unlock the turnstile first
            turnstile.insertCoin();
            expect(turnstile.getCurrentState()).toBe('unlocked');

            // Act: push through
            const resultState = turnstile.pushThrough();

            // Assert: should be locked again
            expect(resultState).toBe('locked');
            expect(turnstile.getCurrentState()).toBe('locked');
            expect(turnstile.isLocked()).toBe(true);
            expect(turnstile.isUnlocked()).toBe(false);
        });

        it('should remain locked when already locked', () => {
            // Arrange: turnstile starts locked
            expect(turnstile.getCurrentState()).toBe('locked');

            // Act: try to push through
            const resultState = turnstile.pushThrough();

            // Assert: should remain locked (blocked passage)
            expect(resultState).toBe('locked');
            expect(turnstile.getCurrentState()).toBe('locked');
            expect(turnstile.isLocked()).toBe(true);
        });
    });

    describe('sendSignal', () => {
        it('should process coin signal correctly', () => {
            const resultState = turnstile.sendSignal('coin');
            expect(resultState).toBe('unlocked');
            expect(turnstile.getCurrentState()).toBe('unlocked');
        });

        it('should process push signal correctly', () => {
            // First unlock
            turnstile.sendSignal('coin');
            
            // Then push through
            const resultState = turnstile.sendSignal('push');
            expect(resultState).toBe('locked');
            expect(turnstile.getCurrentState()).toBe('locked');
        });

        it('should ignore invalid signals', () => {
            const initialState = turnstile.getCurrentState();
            
            // Act: send invalid signal
            const resultState = turnstile.sendSignal('invalid-signal');
            
            // Assert: state should remain unchanged
            expect(resultState).toBe(initialState);
            expect(turnstile.getCurrentState()).toBe(initialState);
        });
    });

    describe('state checking methods', () => {
        describe('isLocked', () => {
            it('should return true when locked', () => {
                expect(turnstile.isLocked()).toBe(true);
            });

            it('should return false when unlocked', () => {
                turnstile.insertCoin();
                expect(turnstile.isLocked()).toBe(false);
            });
        });

        describe('isUnlocked', () => {
            it('should return false when locked', () => {
                expect(turnstile.isUnlocked()).toBe(false);
            });

            it('should return true when unlocked', () => {
                turnstile.insertCoin();
                expect(turnstile.isUnlocked()).toBe(true);
            });
        });
    });

    describe('complete workflow scenarios', () => {
        it('should handle normal usage cycle: coin → push → coin → push', () => {
            // Start: locked
            expect(turnstile.getCurrentState()).toBe('locked');

            // Insert coin: locked → unlocked
            turnstile.insertCoin();
            expect(turnstile.getCurrentState()).toBe('unlocked');

            // Push through: unlocked → locked
            turnstile.pushThrough();
            expect(turnstile.getCurrentState()).toBe('locked');

            // Insert coin again: locked → unlocked
            turnstile.insertCoin();
            expect(turnstile.getCurrentState()).toBe('unlocked');

            // Push through again: unlocked → locked
            turnstile.pushThrough();
            expect(turnstile.getCurrentState()).toBe('locked');
        });

        it('should handle multiple coins before pushing', () => {
            // Insert multiple coins
            turnstile.insertCoin(); // locked → unlocked
            expect(turnstile.getCurrentState()).toBe('unlocked');

            turnstile.insertCoin(); // unlocked → unlocked (no change)
            expect(turnstile.getCurrentState()).toBe('unlocked');

            turnstile.insertCoin(); // unlocked → unlocked (no change)
            expect(turnstile.getCurrentState()).toBe('unlocked');

            // Finally push through
            turnstile.pushThrough(); // unlocked → locked
            expect(turnstile.getCurrentState()).toBe('locked');
        });

        it('should handle multiple push attempts when locked', () => {
            // Try to push multiple times while locked
            expect(turnstile.getCurrentState()).toBe('locked');

            turnstile.pushThrough(); // locked → locked (blocked)
            expect(turnstile.getCurrentState()).toBe('locked');

            turnstile.pushThrough(); // locked → locked (blocked)
            expect(turnstile.getCurrentState()).toBe('locked');

            // Should still be able to unlock with coin
            turnstile.insertCoin(); // locked → unlocked
            expect(turnstile.getCurrentState()).toBe('unlocked');
        });
    });

    describe('inheritance from FiniteStateMachine', () => {
        it('should properly extend FiniteStateMachine', () => {
            expect(turnstile).toBeInstanceOf(TurnstileBase);
            expect(turnstile.getCurrentState).toBeDefined();
            expect(turnstile.sendSignal).toBeDefined();
        });

        it('should have working getCurrentState method', () => {
            const state = turnstile.getCurrentState();
            expect(typeof state).toBe('string');
            expect(['locked', 'unlocked']).toContain(state);
        });
    });

    describe('edge cases', () => {
        it('should handle rapid state changes', () => {
            // Rapid coin insertions and pushes
            for (let i = 0; i < 10; i++) {
                turnstile.insertCoin();
                expect(turnstile.getCurrentState()).toBe('unlocked');
                
                turnstile.pushThrough();
                expect(turnstile.getCurrentState()).toBe('locked');
            }
        });

        it('should maintain state consistency', () => {
            const initialState = turnstile.getCurrentState();
            
            // Perform various operations
            turnstile.sendSignal('invalid');
            turnstile.insertCoin();
            turnstile.sendSignal('another-invalid');
            turnstile.pushThrough();
            turnstile.sendSignal('yet-another-invalid');
            
            // Should be back to initial state
            expect(turnstile.getCurrentState()).toBe(initialState);
        });
    });
});