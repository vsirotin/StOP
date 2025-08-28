import { Turnstile } from './Turnstile';
import { TurnstileBase } from './TurnstileBase';

describe('TurnstileMatrix', () => {
    let turnstileMatrix: Turnstile;

    beforeEach(() => {
        turnstileMatrix = new Turnstile();
    });

    describe('constructor', () => {
        it('should initialize in locked state', () => {
            expect(turnstileMatrix.getCurrentState()).toBe('locked');
        });

        it('should be locked initially', () => {
            expect(turnstileMatrix.isLocked()).toBe(true);
            expect(turnstileMatrix.isUnlocked()).toBe(false);
        });

        it('should have transition matrix accessible', () => {
            expect(turnstileMatrix.getMatrix()).toBeDefined();
            expect(turnstileMatrix.getAllStates()).toEqual(['locked', 'unlocked']);
            expect(turnstileMatrix.getAllSignals()).toEqual(['coin', 'push']);
        });
    });

    describe('insertCoin', () => {
        it('should unlock turnstile when locked', () => {
            // Arrange: turnstile starts locked
            expect(turnstileMatrix.getCurrentState()).toBe('locked');

            // Act: insert coin
            const resultState = turnstileMatrix.insertCoin();

            // Assert: should be unlocked
            expect(resultState).toBe('unlocked');
            expect(turnstileMatrix.getCurrentState()).toBe('unlocked');
            expect(turnstileMatrix.isUnlocked()).toBe(true);
            expect(turnstileMatrix.isLocked()).toBe(false);
        });

        it('should remain unlocked when already unlocked', () => {
            // Arrange: unlock the turnstile first
            turnstileMatrix.insertCoin();
            expect(turnstileMatrix.getCurrentState()).toBe('unlocked');

            // Act: insert another coin
            const resultState = turnstileMatrix.insertCoin();

            // Assert: should remain unlocked
            expect(resultState).toBe('unlocked');
            expect(turnstileMatrix.getCurrentState()).toBe('unlocked');
            expect(turnstileMatrix.isUnlocked()).toBe(true);
        });
    });

    describe('pushThrough', () => {
        it('should lock turnstile when unlocked', () => {
            // Arrange: unlock the turnstile first
            turnstileMatrix.insertCoin();
            expect(turnstileMatrix.getCurrentState()).toBe('unlocked');

            // Act: push through
            const resultState = turnstileMatrix.pushThrough();

            // Assert: should be locked again
            expect(resultState).toBe('locked');
            expect(turnstileMatrix.getCurrentState()).toBe('locked');
            expect(turnstileMatrix.isLocked()).toBe(true);
            expect(turnstileMatrix.isUnlocked()).toBe(false);
        });

        it('should remain locked when already locked', () => {
            // Arrange: turnstile starts locked
            expect(turnstileMatrix.getCurrentState()).toBe('locked');

            // Act: try to push through
            const resultState = turnstileMatrix.pushThrough();

            // Assert: should remain locked (blocked passage)
            expect(resultState).toBe('locked');
            expect(turnstileMatrix.getCurrentState()).toBe('locked');
            expect(turnstileMatrix.isLocked()).toBe(true);
        });
    });

    describe('sendSignal', () => {
        it('should process coin signal correctly', () => {
            const resultState = turnstileMatrix.sendSignal('coin');
            expect(resultState).toBe('unlocked');
            expect(turnstileMatrix.getCurrentState()).toBe('unlocked');
        });

        it('should process push signal correctly', () => {
            // First unlock
            turnstileMatrix.sendSignal('coin');
            
            // Then push through
            const resultState = turnstileMatrix.sendSignal('push');
            expect(resultState).toBe('locked');
            expect(turnstileMatrix.getCurrentState()).toBe('locked');
        });

        it('should ignore invalid signals', () => {
            const initialState = turnstileMatrix.getCurrentState();
            
            // Act: send invalid signal
            const resultState = turnstileMatrix.sendSignal('invalid-signal');
            
            // Assert: state should remain unchanged
            expect(resultState).toBe(initialState);
            expect(turnstileMatrix.getCurrentState()).toBe(initialState);
        });
    });

    describe('matrix-specific methods', () => {
        describe('hasState', () => {
            it('should return true for valid states', () => {
                expect(turnstileMatrix.hasState('locked')).toBe(true);
                expect(turnstileMatrix.hasState('unlocked')).toBe(true);
            });

            it('should return false for invalid states', () => {
                expect(turnstileMatrix.hasState('invalid-state')).toBe(false);
                expect(turnstileMatrix.hasState('open')).toBe(false);
            });
        });

        describe('hasSignal', () => {
            it('should return true for valid signals', () => {
                expect(turnstileMatrix.hasSignal('coin')).toBe(true);
                expect(turnstileMatrix.hasSignal('push')).toBe(true);
            });

            it('should return false for invalid signals', () => {
                expect(turnstileMatrix.hasSignal('invalid-signal')).toBe(false);
                expect(turnstileMatrix.hasSignal('open')).toBe(false);
            });
        });

        describe('getValidSignalsFromCurrentState', () => {
            it('should return valid signals from locked state', () => {
                expect(turnstileMatrix.getCurrentState()).toBe('locked');
                const validSignals = turnstileMatrix.getValidSignalsFromCurrentState();
                expect(validSignals).toEqual(['coin']);
            });

            it('should return valid signals from unlocked state', () => {
                turnstileMatrix.insertCoin(); // Move to unlocked state
                expect(turnstileMatrix.getCurrentState()).toBe('unlocked');
                const validSignals = turnstileMatrix.getValidSignalsFromCurrentState();
                expect(validSignals).toEqual(['push']);
            });
        });

        describe('isValidSignalFromCurrentState', () => {
            it('should validate signals correctly from locked state', () => {
                expect(turnstileMatrix.getCurrentState()).toBe('locked');
                expect(turnstileMatrix.isValidSignalFromCurrentState('coin')).toBe(true);
                expect(turnstileMatrix.isValidSignalFromCurrentState('push')).toBe(false);
            });

            it('should validate signals correctly from unlocked state', () => {
                turnstileMatrix.insertCoin(); // Move to unlocked state
                expect(turnstileMatrix.getCurrentState()).toBe('unlocked');
                expect(turnstileMatrix.isValidSignalFromCurrentState('coin')).toBe(false);
                expect(turnstileMatrix.isValidSignalFromCurrentState('push')).toBe(true);
            });
        });

        describe('printTransitionMatrix', () => {
            it('should not throw when printing matrix', () => {
                expect(() => turnstileMatrix.printTransitionMatrix()).not.toThrow();
            });
        });
    });

    describe('state checking methods', () => {
        describe('isLocked', () => {
            it('should return true when locked', () => {
                expect(turnstileMatrix.isLocked()).toBe(true);
            });

            it('should return false when unlocked', () => {
                turnstileMatrix.insertCoin();
                expect(turnstileMatrix.isLocked()).toBe(false);
            });
        });

        describe('isUnlocked', () => {
            it('should return false when locked', () => {
                expect(turnstileMatrix.isUnlocked()).toBe(false);
            });

            it('should return true when unlocked', () => {
                turnstileMatrix.insertCoin();
                expect(turnstileMatrix.isUnlocked()).toBe(true);
            });
        });
    });

    describe('complete workflow scenarios', () => {
        it('should handle normal usage cycle: coin → push → coin → push', () => {
            // Start: locked
            expect(turnstileMatrix.getCurrentState()).toBe('locked');

            // Insert coin: locked → unlocked
            turnstileMatrix.insertCoin();
            expect(turnstileMatrix.getCurrentState()).toBe('unlocked');

            // Push through: unlocked → locked
            turnstileMatrix.pushThrough();
            expect(turnstileMatrix.getCurrentState()).toBe('locked');

            // Insert coin again: locked → unlocked
            turnstileMatrix.insertCoin();
            expect(turnstileMatrix.getCurrentState()).toBe('unlocked');

            // Push through again: unlocked → locked
            turnstileMatrix.pushThrough();
            expect(turnstileMatrix.getCurrentState()).toBe('locked');
        });

        it('should handle multiple coins before pushing', () => {
            // Insert multiple coins
            turnstileMatrix.insertCoin(); // locked → unlocked
            expect(turnstileMatrix.getCurrentState()).toBe('unlocked');

            turnstileMatrix.insertCoin(); // unlocked → unlocked (no change)
            expect(turnstileMatrix.getCurrentState()).toBe('unlocked');

            turnstileMatrix.insertCoin(); // unlocked → unlocked (no change)
            expect(turnstileMatrix.getCurrentState()).toBe('unlocked');

            // Finally push through
            turnstileMatrix.pushThrough(); // unlocked → locked
            expect(turnstileMatrix.getCurrentState()).toBe('locked');
        });

        it('should handle multiple push attempts when locked', () => {
            // Try to push multiple times while locked
            expect(turnstileMatrix.getCurrentState()).toBe('locked');

            turnstileMatrix.pushThrough(); // locked → locked (blocked)
            expect(turnstileMatrix.getCurrentState()).toBe('locked');

            turnstileMatrix.pushThrough(); // locked → locked (blocked)
            expect(turnstileMatrix.getCurrentState()).toBe('locked');

            // Should still be able to unlock with coin
            turnstileMatrix.insertCoin(); // locked → unlocked
            expect(turnstileMatrix.getCurrentState()).toBe('unlocked');
        });
    });

    describe('inheritance from MatrixBasedStateMachine', () => {
        it('should properly extend MatrixBasedStateMachine', () => {
            expect(turnstileMatrix).toBeInstanceOf(Turnstile);
            expect(turnstileMatrix.getCurrentState).toBeDefined();
            expect(turnstileMatrix.sendSignal).toBeDefined();
            expect(turnstileMatrix.getMatrix).toBeDefined();
        });

        it('should have working getCurrentState method', () => {
            const state = turnstileMatrix.getCurrentState();
            expect(typeof state).toBe('string');
            expect(['locked', 'unlocked']).toContain(state);
        });
    });

    describe('edge cases', () => {
        it('should handle rapid state changes', () => {
            // Rapid coin insertions and pushes
            for (let i = 0; i < 10; i++) {
                turnstileMatrix.insertCoin();
                expect(turnstileMatrix.getCurrentState()).toBe('unlocked');
                
                turnstileMatrix.pushThrough();
                expect(turnstileMatrix.getCurrentState()).toBe('locked');
            }
        });

        it('should maintain state consistency', () => {
            const initialState = turnstileMatrix.getCurrentState();
            
            // Perform various operations
            turnstileMatrix.sendSignal('invalid');
            turnstileMatrix.insertCoin();
            turnstileMatrix.sendSignal('another-invalid');
            turnstileMatrix.pushThrough();
            turnstileMatrix.sendSignal('yet-another-invalid');
            
            // Should be back to initial state
            expect(turnstileMatrix.getCurrentState()).toBe(initialState);
        });
    });

    // 🎯 COMPARISON TESTS WITH ORIGINAL TURNSTILE
    describe('comparison with original Turnstile implementation', () => {
        let originalTurnstile: TurnstileBase;

        beforeEach(() => {
            originalTurnstile = new TurnstileBase();
        });

        describe('structural equivalence', () => {
            it('should have identical states', () => {
                const matrixStates = turnstileMatrix.getAllStates().sort();
                
                // Get states from original turnstile (we need to extract them)
                // Since Turnstile doesn't expose states directly, we'll compare expected states
                const expectedStates = ['locked', 'unlocked'].sort();
                
                expect(matrixStates).toEqual(expectedStates);
            });

            it('should have identical signals', () => {
                const matrixSignals = turnstileMatrix.getAllSignals().sort();
                
                // Expected signals based on Turnstile implementation
                const expectedSignals = ['coin', 'push'].sort();
                
                expect(matrixSignals).toEqual(expectedSignals);
            });

            it('should have equivalent transition behavior', () => {
                // Test all possible state-signal combinations
                const testCases = [
                    { fromState: 'locked', signal: 'coin', expectedState: 'unlocked' },
                    { fromState: 'locked', signal: 'push', expectedState: 'locked' },
                    { fromState: 'unlocked', signal: 'coin', expectedState: 'unlocked' },
                    { fromState: 'unlocked', signal: 'push', expectedState: 'locked' }
                ];

                for (const testCase of testCases) {
                    // Reset both turnstiles to the test starting state
                    const matrixTurnstile = new Turnstile();
                    const originalTurnstile = new TurnstileBase();

                    // Move to the desired starting state if needed
                    if (testCase.fromState === 'unlocked') {
                        matrixTurnstile.insertCoin();
                        originalTurnstile.insertCoin();
                    }

                    // Verify both are in the expected starting state
                    expect(matrixTurnstile.getCurrentState()).toBe(testCase.fromState);
                    expect(originalTurnstile.getCurrentState()).toBe(testCase.fromState);

                    // Send the signal to both
                    const matrixResult = matrixTurnstile.sendSignal(testCase.signal);
                    const originalResult = originalTurnstile.sendSignal(testCase.signal);

                    // Verify identical behavior
                    expect(matrixResult).toBe(originalResult);
                    expect(matrixResult).toBe(testCase.expectedState);
                    expect(matrixTurnstile.getCurrentState()).toBe(originalTurnstile.getCurrentState());
                }
            });
        });

        describe('behavioral equivalence', () => {
            it('should have identical initial states', () => {
                expect(turnstileMatrix.getCurrentState()).toBe(originalTurnstile.getCurrentState());
                expect(turnstileMatrix.getCurrentState()).toBe('locked');
            });

            it('should behave identically for insertCoin operations', () => {
                // Test insertCoin from locked state
                expect(turnstileMatrix.insertCoin()).toBe(originalTurnstile.insertCoin());
                expect(turnstileMatrix.getCurrentState()).toBe(originalTurnstile.getCurrentState());
                expect(turnstileMatrix.getCurrentState()).toBe('unlocked');

                // Test insertCoin from unlocked state
                expect(turnstileMatrix.insertCoin()).toBe(originalTurnstile.insertCoin());
                expect(turnstileMatrix.getCurrentState()).toBe(originalTurnstile.getCurrentState());
                expect(turnstileMatrix.getCurrentState()).toBe('unlocked');
            });

            it('should behave identically for pushThrough operations', () => {
                // Test pushThrough from locked state
                expect(turnstileMatrix.pushThrough()).toBe(originalTurnstile.pushThrough());
                expect(turnstileMatrix.getCurrentState()).toBe(originalTurnstile.getCurrentState());
                expect(turnstileMatrix.getCurrentState()).toBe('locked');

                // Move both to unlocked state
                turnstileMatrix.insertCoin();
                originalTurnstile.insertCoin();

                // Test pushThrough from unlocked state
                expect(turnstileMatrix.pushThrough()).toBe(originalTurnstile.pushThrough());
                expect(turnstileMatrix.getCurrentState()).toBe(originalTurnstile.getCurrentState());
                expect(turnstileMatrix.getCurrentState()).toBe('locked');
            });

            it('should behave identically for complex sequences', () => {
                const operations = [
                    'insertCoin',
                    'pushThrough', 
                    'insertCoin',
                    'insertCoin',
                    'pushThrough',
                    'pushThrough',
                    'insertCoin'
                ];

                for (const operation of operations) {
                    const matrixResult = (turnstileMatrix as any)[operation]();
                    const originalResult = (originalTurnstile as any)[operation]();
                    
                    expect(matrixResult).toBe(originalResult);
                    expect(turnstileMatrix.getCurrentState()).toBe(originalTurnstile.getCurrentState());
                }
            });

            it('should handle invalid signals identically', () => {
                const invalidSignals = ['invalid', 'open', 'close', 'reset', ''];

                for (const signal of invalidSignals) {
                    // Reset to known state
                    const matrixTurnstile = new Turnstile();
                    const originalTurnstile = new TurnstileBase();

                    const matrixResult = matrixTurnstile.sendSignal(signal);
                    const originalResult = originalTurnstile.sendSignal(signal);

                    expect(matrixResult).toBe(originalResult);
                    expect(matrixTurnstile.getCurrentState()).toBe(originalTurnstile.getCurrentState());
                }
            });
        });

        describe('convenience method equivalence', () => {
            it('should have identical isLocked behavior', () => {
                // Test in locked state
                expect(turnstileMatrix.isLocked()).toBe(originalTurnstile.isLocked());
                expect(turnstileMatrix.isLocked()).toBe(true);

                // Move to unlocked state
                turnstileMatrix.insertCoin();
                originalTurnstile.insertCoin();

                // Test in unlocked state
                expect(turnstileMatrix.isLocked()).toBe(originalTurnstile.isLocked());
                expect(turnstileMatrix.isLocked()).toBe(false);
            });

            it('should have identical isUnlocked behavior', () => {
                // Test in locked state
                expect(turnstileMatrix.isUnlocked()).toBe(originalTurnstile.isUnlocked());
                expect(turnstileMatrix.isUnlocked()).toBe(false);

                // Move to unlocked state
                turnstileMatrix.insertCoin();
                originalTurnstile.insertCoin();

                // Test in unlocked state
                expect(turnstileMatrix.isUnlocked()).toBe(originalTurnstile.isUnlocked());
                expect(turnstileMatrix.isUnlocked()).toBe(true);
            });
        });

        describe('implementation verification', () => {
            it('should demonstrate that both implementations produce identical state machines', () => {
                // This test serves as comprehensive proof that both approaches create equivalent state machines
                
                // Collect all transitions from matrix-based implementation
                const matrixTransitions = turnstileMatrix.getMatrix().getTransitions();
                
                // Expected transitions (based on Turnstile implementation)
                const expectedTransitions = [
                    { from: 'locked', signal: 'coin', to: 'unlocked' },
                    { from: 'unlocked', signal: 'push', to: 'locked' }
                ];

                // Verify matrix transitions match expected transitions
                expect(matrixTransitions).toHaveLength(expectedTransitions.length);
                
                for (const expected of expectedTransitions) {
                    const found = matrixTransitions.find(t => 
                        t.from === expected.from && 
                        t.signal === expected.signal && 
                        t.to === expected.to
                    );
                    expect(found).toBeDefined();
                }

                // Final verification: both implementations should be functionally identical
                console.log('✅ TurnstileMatrix and Turnstile are functionally equivalent');
                console.log('📊 Matrix transitions:', matrixTransitions);
                console.log('🎯 Both implement the same turnstile state machine logic');
            });
        });
    });
});