/// <reference types="jest" />
import { TurnstileObject, LockedState, UnlockedState } from './TurnstileObjects';
import { TurnstileSignal } from './TurnstileSignal';

describe('TurnstileObject', () => {
    let turnstile: TurnstileObject;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        // Create fresh instance for each test
        turnstile = new TurnstileObject();
        
        // Spy on console.log to verify action execution
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        // Restore console.log after each test
        consoleSpy.mockRestore();
    });

    describe('Constructor and Initial State', () => {
        test('should initialize in locked state', () => {
            expect(turnstile.isLocked()).toBe(true);
            expect(turnstile.isUnlocked()).toBe(false);
        });

        test('should have correct initial state type', () => {
            const currentState = turnstile.getCurrentState();
            expect(currentState).toBeInstanceOf(LockedState);
            expect(currentState.toString()).toBe('locked');
        });
    });

    describe('State Transitions - insertCoin()', () => {
        test('should transition from locked to unlocked when coin inserted', () => {
            expect(turnstile.isLocked()).toBe(true);
            
            const resultState = turnstile.insertCoin();
            
            expect(turnstile.isUnlocked()).toBe(true);
            expect(turnstile.isLocked()).toBe(false);
            expect(resultState).toBeInstanceOf(UnlockedState);
        });

        test('should execute proper action sequence during coin insertion', () => {
            consoleSpy.mockClear(); // Clear initialization logs
            
            turnstile.insertCoin();
            
            expect(consoleSpy).toHaveBeenCalledWith(
                'Processing payment - preparing to unlock...'
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                'Turnstile is now UNLOCKED - passage allowed'
            );
        });

        test('should remain unlocked when coin inserted while already unlocked', () => {
            // First, unlock the turnstile
            turnstile.insertCoin();
            expect(turnstile.isUnlocked()).toBe(true);
            
            consoleSpy.mockClear();
            
            // Insert another coin
            const resultState = turnstile.insertCoin();
            
            // Should remain unlocked, no actions executed
            expect(turnstile.isUnlocked()).toBe(true);
            expect(resultState).toBeInstanceOf(UnlockedState);
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        test('should return correct state object after coin insertion', () => {
            const resultState = turnstile.insertCoin();
            
            expect(resultState.toString()).toBe('unlocked');
            expect(resultState).toBeInstanceOf(UnlockedState);
        });
    });

    describe('State Transitions - pushThrough()', () => {
        test('should remain locked when pushing while locked', () => {
            expect(turnstile.isLocked()).toBe(true);
            
            consoleSpy.mockClear();
            const resultState = turnstile.pushThrough();
            
            // Should remain locked, no actions executed
            expect(turnstile.isLocked()).toBe(true);
            expect(resultState).toBeInstanceOf(LockedState);
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        test('should transition from unlocked to locked when pushing through', () => {
            // First unlock
            turnstile.insertCoin();
            expect(turnstile.isUnlocked()).toBe(true);
            
            consoleSpy.mockClear();
            const resultState = turnstile.pushThrough();
            
            expect(turnstile.isLocked()).toBe(true);
            expect(turnstile.isUnlocked()).toBe(false);
            expect(resultState).toBeInstanceOf(LockedState);
        });

        test('should execute proper action sequence during push through', () => {
            // First unlock
            turnstile.insertCoin();
            consoleSpy.mockClear();
            
            turnstile.pushThrough();
            
            expect(consoleSpy).toHaveBeenCalledWith(
                'Person passing through - preparing to lock...'
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                'Turnstile is now LOCKED - passage blocked'
            );
        });
    });

    describe('Complete Workflow Scenarios', () => {
        test('should handle complete turnstile usage cycle', () => {
            consoleSpy.mockClear();
            
            // 1. Start locked
            expect(turnstile.isLocked()).toBe(true);
            
            // 2. Insert coin → unlock
            turnstile.insertCoin();
            expect(turnstile.isUnlocked()).toBe(true);
            
            // 3. Push through → lock
            turnstile.pushThrough();
            expect(turnstile.isLocked()).toBe(true);
            
            // Verify all actions were executed in correct order
            expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Processing payment - preparing to unlock...');
            expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Turnstile is now UNLOCKED - passage allowed');
            expect(consoleSpy).toHaveBeenNthCalledWith(3, 'Person passing through - preparing to lock...');
            expect(consoleSpy).toHaveBeenNthCalledWith(4, 'Turnstile is now LOCKED - passage blocked');
        });

        test('should handle multiple complete cycles', () => {
            for (let i = 0; i < 3; i++) {
                expect(turnstile.isLocked()).toBe(true);
                
                turnstile.insertCoin();
                expect(turnstile.isUnlocked()).toBe(true);
                
                turnstile.pushThrough();
                expect(turnstile.isLocked()).toBe(true);
            }
        });

        test('should handle rapid state changes correctly', () => {
            // Rapid sequence of operations
            turnstile.insertCoin();
            turnstile.pushThrough();
            turnstile.insertCoin();
            turnstile.pushThrough();
            
            // Should end in locked state
            expect(turnstile.isLocked()).toBe(true);
        });
    });

    describe('Signal Processing', () => {
        test('should process COIN signal correctly', () => {
            const resultState = turnstile.sendSignal(TurnstileSignal.COIN);
            expect(resultState).toBeInstanceOf(UnlockedState);
            expect(turnstile.isUnlocked()).toBe(true);
        });

        test('should process PUSH signal correctly', () => {
            // First unlock
            turnstile.insertCoin();
            
            const resultState = turnstile.sendSignal(TurnstileSignal.PUSH);
            expect(resultState).toBeInstanceOf(LockedState);
            expect(turnstile.isLocked()).toBe(true);
        });

        test('should handle invalid signal transitions gracefully', () => {
            // Try to push while locked (invalid transition)
            const initialState = turnstile.getCurrentState();
            const resultState = turnstile.sendSignal(TurnstileSignal.PUSH);
            
            expect(resultState).toBe(initialState);
            expect(turnstile.isLocked()).toBe(true);
        });
    });

    describe('State Information and Queries', () => {
        test('should provide accurate state information', () => {
            expect(turnstile.isLocked()).toBe(true);
            expect(turnstile.isUnlocked()).toBe(false);
            
            turnstile.insertCoin();
            
            expect(turnstile.isLocked()).toBe(false);
            expect(turnstile.isUnlocked()).toBe(true);
        });

        test('should return consistent state objects', () => {
            const state1 = turnstile.getCurrentState();
            const state2 = turnstile.getCurrentState();
            
            expect(state1).toBe(state2); // Same reference
            expect(state1.toString()).toBe(state2.toString());
        });
    });

    describe('Matrix-based Implementation', () => {
        test('should inherit from TurnstileAbstract', () => {
            expect(turnstile).toBeInstanceOf(TurnstileObject);
            // Note: We can't test TurnstileAbstract directly without importing it,
            // but we can verify the expected methods exist
            expect(typeof turnstile.insertCoin).toBe('function');
            expect(typeof turnstile.pushThrough).toBe('function');
            expect(typeof turnstile.isLocked).toBe('function');
            expect(typeof turnstile.isUnlocked).toBe('function');
        });

        test('should have proper matrix-based state machine methods', () => {
            expect(typeof turnstile.sendSignal).toBe('function');
            expect(typeof turnstile.getCurrentState).toBe('function');
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle multiple consecutive coin insertions', () => {
            turnstile.insertCoin(); // Unlock
            expect(turnstile.isUnlocked()).toBe(true);
            
            consoleSpy.mockClear();
            
            // Multiple additional coins should not change state
            turnstile.insertCoin();
            turnstile.insertCoin();
            
            expect(turnstile.isUnlocked()).toBe(true);
            expect(consoleSpy).not.toHaveBeenCalled(); // No additional actions
        });

        test('should handle multiple consecutive push attempts', () => {
            consoleSpy.mockClear();
            
            // Multiple pushes while locked should not change state
            turnstile.pushThrough();
            turnstile.pushThrough();
            turnstile.pushThrough();
            
            expect(turnstile.isLocked()).toBe(true);
            expect(consoleSpy).not.toHaveBeenCalled(); // No actions executed
        });
    });

    describe('State Action Verification', () => {
        test('should execute entry actions exactly once per state transition', () => {
            consoleSpy.mockClear();
            
            // Transition to unlocked
            turnstile.insertCoin();
            
            // Should have exactly one entry action call
            const unlockedEntryActions = consoleSpy.mock.calls.filter(
                call => call[0] === 'Turnstile is now UNLOCKED - passage allowed'
            );
            expect(unlockedEntryActions).toHaveLength(1);
        });

        test('should execute exit actions exactly once per state transition', () => {
            consoleSpy.mockClear();
            
            // Transition from locked to unlocked
            turnstile.insertCoin();
            
            // Should have exactly one exit action call
            const lockedExitActions = consoleSpy.mock.calls.filter(
                call => call[0] === 'Processing payment - preparing to unlock...'
            );
            expect(lockedExitActions).toHaveLength(1);
        });

        test('should not execute actions for self-transitions', () => {
            // First unlock the turnstile
            turnstile.insertCoin();
            consoleSpy.mockClear();
            
            // Try to insert another coin (self-transition)
            turnstile.insertCoin();
            
            // No actions should be executed
            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });
});