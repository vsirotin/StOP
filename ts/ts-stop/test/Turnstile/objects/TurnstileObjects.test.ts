/// <reference types="jest" />
import { TurnstileObject, LockedState, UnlockedState } from './TurnstileObjects';
import { TurnstileSignal } from './TurnstileSignal';

describe('TurnstileObject', () => {
    let turnstile: TurnstileObject;

    function isLocked(): boolean {
        return turnstile.getCurrentState() instanceof LockedState;
    }

    function isUnlocked(): boolean {
        return turnstile.getCurrentState() instanceof UnlockedState;
    }

    beforeEach(() => {
        // Create fresh instance for each test
        turnstile = new TurnstileObject();
    });


    describe('Constructor and Initial State', () => {
        test('should initialize in locked state', () => {
            expect(isLocked()).toBe(true);
            expect(isUnlocked()).toBe(false);
        });

        test('should have correct initial state type', () => {
            const currentState = turnstile.getCurrentState();
            expect(currentState).toBeInstanceOf(LockedState);
            expect(currentState.toString()).toBe('locked');
        });
    });

    describe('State Transitions - insertCoin()', () => {
        test('should transition from locked to unlocked when coin inserted', () => {
            expect(isLocked()).toBe(true);
            
            const resultState = turnstile.insertCoin();
            
            expect(isUnlocked()).toBe(true);
            expect(isLocked()).toBe(false);
            expect(resultState).toBeInstanceOf(UnlockedState);
        });


        test('should remain unlocked when coin inserted while already unlocked', () => {
            // First, unlock the turnstile
            turnstile.insertCoin();
            expect(isUnlocked()).toBe(true);
            
            
            // Insert another coin
            const resultState = turnstile.insertCoin();
            
            // Should remain unlocked, no actions executed
            expect(isUnlocked()).toBe(true);
            expect(resultState).toBeInstanceOf(UnlockedState);
        });

        test('should return correct state object after coin insertion', () => {
            const resultState = turnstile.insertCoin();
            
            expect(resultState.toString()).toBe('unlocked');
            expect(resultState).toBeInstanceOf(UnlockedState);
        });
    });

    describe('State Transitions - pushThrough()', () => {
        test('should remain locked when pushing while locked', () => {
            expect(isLocked()).toBe(true);
        
            const resultState = turnstile.pushThrough();
            
            // Should remain locked, no actions executed
            expect(isLocked()).toBe(true);
            expect(resultState).toBeInstanceOf(LockedState);
        });

        test('should transition from unlocked to locked when pushing through', () => {
            // First unlock
            turnstile.insertCoin();
            expect(isUnlocked()).toBe(true);
            const resultState = turnstile.pushThrough();
            
            expect(isLocked()).toBe(true);
            expect(isUnlocked()).toBe(false);
            expect(resultState).toBeInstanceOf(LockedState);
        });

    });

    describe('Complete Workflow Scenarios', () => {
        test('should handle complete turnstile usage cycle', () => {
            
            // 1. Start locked
            expect(isLocked()).toBe(true);
            
            // 2. Insert coin → unlock
            turnstile.insertCoin();
            expect(isUnlocked()).toBe(true);
            
            // 3. Push through → lock
            turnstile.pushThrough();
            expect(isLocked()).toBe(true);
        });

        test('should handle multiple complete cycles', () => {
            for (let i = 0; i < 3; i++) {
                expect(isLocked()).toBe(true);
                
                turnstile.insertCoin();
                expect(isUnlocked()).toBe(true);
                
                turnstile.pushThrough();
                expect(isLocked()).toBe(true);
            }
        });

        test('should handle rapid state changes correctly', () => {
            // Rapid sequence of operations
            turnstile.insertCoin();
            turnstile.pushThrough();
            turnstile.insertCoin();
            turnstile.pushThrough();
            
            // Should end in locked state
            expect(isLocked()).toBe(true);
        });
    });


    describe('State Information and Queries', () => {
        test('should provide accurate state information', () => {
            expect(isLocked()).toBe(true);
            expect(isUnlocked()).toBe(false);
            
            turnstile.insertCoin();
            
            expect(isLocked()).toBe(false);
            expect(isUnlocked()).toBe(true);
        });

        test('should return consistent state objects', () => {
            const state1 = turnstile.getCurrentState();
            const state2 = turnstile.getCurrentState();
            
            expect(state1).toBe(state2); // Same reference
            expect(state1.toString()).toBe(state2.toString());
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle multiple consecutive coin insertions', () => {
            turnstile.insertCoin(); // Unlock
            expect(isUnlocked()).toBe(true);
            
            // Multiple additional coins should not change state
            turnstile.insertCoin();
            turnstile.insertCoin();
            
            expect(isUnlocked()).toBe(true);
        });

        test('should handle multiple consecutive push attempts', () => {
            
            // Multiple pushes while locked should not change state
            turnstile.pushThrough();
            turnstile.pushThrough();
            turnstile.pushThrough();
            
            expect(isLocked()).toBe(true);
        });
    });

});