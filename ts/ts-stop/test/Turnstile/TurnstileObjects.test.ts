import { TurnstileObject, TurnstileSignal, LockedState, UnlockedState } from './TurnstileObjects';

describe('TurnstileObjects', () => {
    let turnstileObject: TurnstileObject;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        // Setup console spy BEFORE creating the object
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        
        // Now create the object (this will trigger constructor log)
        turnstileObject = new TurnstileObject();
        
        // Clear the spy to ignore constructor logs for most tests
        consoleSpy.mockClear();
    });

    afterEach(() => {
        consoleSpy.mockClear();
        // Restore console.log
        jest.restoreAllMocks();
    });

    describe('TurnstileSignal enum', () => {
        it('should have correct enum values', () => {
            expect(TurnstileSignal.COIN).toBe('coin');
            expect(TurnstileSignal.PUSH).toBe('push');
        });

        it('should have exactly two enum values', () => {
            const values = Object.values(TurnstileSignal);
            expect(values).toHaveLength(2);
            expect(values).toContain('coin');
            expect(values).toContain('push');
        });
    });

    describe('LockedState', () => {
        let lockedState: LockedState;

        beforeEach(() => {
            lockedState = new LockedState();
        });

        it('should implement IStateWithActions interface', () => {
            expect(lockedState.afterEntryAction).toBeDefined();
            expect(lockedState.beforeExitAction).toBeDefined();
            expect(typeof lockedState.afterEntryAction).toBe('function');
            expect(typeof lockedState.beforeExitAction).toBe('function');
        });

        it('should have correct toString representation', () => {
            expect(lockedState.toString()).toBe('locked');
        });

        it('should execute afterEntryAction without errors', () => {
            expect(() => lockedState.afterEntryAction()).not.toThrow();
        });

        it('should execute beforeExitAction without errors', () => {
            expect(() => lockedState.beforeExitAction()).not.toThrow();
        });

        it('should log appropriate messages on actions', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            
            lockedState.afterEntryAction();
            expect(consoleSpy).toHaveBeenCalledWith("Turnstile is now LOCKED - passage blocked");
            
            lockedState.beforeExitAction();
            expect(consoleSpy).toHaveBeenCalledWith("Processing payment - preparing to unlock...");
        });
    });

    describe('UnlockedState', () => {
        let unlockedState: UnlockedState;

        beforeEach(() => {
            unlockedState = new UnlockedState();
        });

        it('should implement IStateWithActions interface', () => {
            expect(unlockedState.afterEntryAction).toBeDefined();
            expect(unlockedState.beforeExitAction).toBeDefined();
            expect(typeof unlockedState.afterEntryAction).toBe('function');
            expect(typeof unlockedState.beforeExitAction).toBe('function');
        });

        it('should have correct toString representation', () => {
            expect(unlockedState.toString()).toBe('unlocked');
        });

        it('should execute afterEntryAction without errors', () => {
            expect(() => unlockedState.afterEntryAction()).not.toThrow();
        });

        it('should execute beforeExitAction without errors', () => {
            expect(() => unlockedState.beforeExitAction()).not.toThrow();
        });

        it('should log appropriate messages on actions', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            
            unlockedState.afterEntryAction();
            expect(consoleSpy).toHaveBeenCalledWith("Turnstile is now UNLOCKED - passage allowed");
            
            unlockedState.beforeExitAction();
            expect(consoleSpy).toHaveBeenCalledWith("Person passing through - preparing to lock...");
        });
    });

    describe('TurnstileObject constructor', () => {
        it('should execute initial state entry action', () => {
            // Create a fresh spy for this test
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            
            // Create new instance to capture constructor log
            new TurnstileObject();
            
            expect(consoleSpy).toHaveBeenCalledWith("Turnstile is now LOCKED - passage blocked");
            
            // Clean up
            consoleSpy.mockRestore();
        });
        
        // Remove the accessibility test that calls missing methods
        it('should have correct initial state', () => {
            expect(turnstileObject.getCurrentStateString()).toBe('locked');
            expect(turnstileObject.isLocked()).toBe(true);
            expect(turnstileObject.isUnlocked()).toBe(false);
        });
    });

    describe('insertCoin method', () => {
        it('should unlock turnstile when locked and execute state actions', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            
            // Ensure starting state
            expect(turnstileObject.getCurrentStateString()).toBe('locked');
            
            // Insert coin
            const resultState = turnstileObject.insertCoin();
            
            // Verify state change
            expect(turnstileObject.getCurrentStateString()).toBe('unlocked');
            expect(turnstileObject.isUnlocked()).toBe(true);
            expect(turnstileObject.isLocked()).toBe(false);
            expect(resultState.toString()).toBe('unlocked');
            
            // Verify actions were executed
            expect(consoleSpy).toHaveBeenCalledWith("Processing payment - preparing to unlock...");
            expect(consoleSpy).toHaveBeenCalledWith("Turnstile is now UNLOCKED - passage allowed");
        });

        it('should remain unlocked when already unlocked', () => {
            // First unlock
            turnstileObject.insertCoin();
            expect(turnstileObject.getCurrentStateString()).toBe('unlocked');
            
            const consoleSpy = jest.spyOn(console, 'log');
             consoleSpy.mockClear();
            
            // Insert another coin
            const resultState = turnstileObject.insertCoin();
            
            // Should remain unlocked, no state transition
            expect(turnstileObject.getCurrentStateString()).toBe('unlocked');
            expect(resultState.toString()).toBe('unlocked');
            
            // No exit/entry actions should be called (no transition)
            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });

    describe('pushThrough method', () => {
        it('should lock turnstile when unlocked and execute state actions', () => {
            // First unlock
            turnstileObject.insertCoin();
            expect(turnstileObject.getCurrentStateString()).toBe('unlocked');
            
            const consoleSpy = jest.spyOn(console, 'log');
            
            // Push through
            const resultState = turnstileObject.pushThrough();
            
            // Verify state change
            expect(turnstileObject.getCurrentStateString()).toBe('locked');
            expect(turnstileObject.isLocked()).toBe(true);
            expect(turnstileObject.isUnlocked()).toBe(false);
            expect(resultState.toString()).toBe('locked');
            
            // Verify actions were executed
            expect(consoleSpy).toHaveBeenCalledWith("Person passing through - preparing to lock...");
            expect(consoleSpy).toHaveBeenCalledWith("Turnstile is now LOCKED - passage blocked");
        });

        it('should remain locked when already locked', () => {
            // Ensure starting in locked state
            expect(turnstileObject.getCurrentStateString()).toBe('locked');
            
            const consoleSpy = jest.spyOn(console, 'log');
            
            // Try to push through
            const resultState = turnstileObject.pushThrough();
            
            // Should remain locked, no state transition
            expect(turnstileObject.getCurrentStateString()).toBe('locked');
            expect(resultState.toString()).toBe('locked');
            
            // No exit/entry actions should be called (no transition)
            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });

    describe('sendSignal method with state actions', () => {
        it('should execute state actions on valid transitions', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            
            // Test COIN signal (locked -> unlocked)
            const resultState1 = turnstileObject.sendSignal(TurnstileSignal.COIN);
            expect(resultState1.toString()).toBe('unlocked');
            expect(consoleSpy).toHaveBeenCalledWith("Processing payment - preparing to unlock...");
            expect(consoleSpy).toHaveBeenCalledWith("Turnstile is now UNLOCKED - passage allowed");
            
            consoleSpy.mockClear();
            
            // Test PUSH signal (unlocked -> locked)
            const resultState2 = turnstileObject.sendSignal(TurnstileSignal.PUSH);
            expect(resultState2.toString()).toBe('locked');
            expect(consoleSpy).toHaveBeenCalledWith("Person passing through - preparing to lock...");
            expect(consoleSpy).toHaveBeenCalledWith("Turnstile is now LOCKED - passage blocked");
        });

        it('should not execute state actions on invalid transitions', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            
            // Test invalid signal
            const resultState = turnstileObject.sendSignal('invalid-signal' as TurnstileSignal);
            expect(resultState.toString()).toBe('locked');
            
            // No actions should be executed
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        it('should not execute actions when no state transition occurs', () => {
            // Move to unlocked state first
            turnstileObject.insertCoin();
            
            const consoleSpy = jest.spyOn(console, 'log');
             consoleSpy.mockClear();
            
            // Send COIN signal when already unlocked (no transition)
            const resultState = turnstileObject.sendSignal(TurnstileSignal.COIN);
            expect(resultState.toString()).toBe('unlocked');
            
            // No actions should be executed
            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });

    describe('state checking methods', () => {
        it('should correctly identify locked state', () => {
            expect(turnstileObject.isLocked()).toBe(true);
            expect(turnstileObject.isUnlocked()).toBe(false);
            
            // Reference equality check
            expect(turnstileObject.getCurrentState()).toBe(turnstileObject.getLockedState());
        });

        it('should correctly identify unlocked state', () => {
            turnstileObject.insertCoin();
            
            expect(turnstileObject.isLocked()).toBe(false);
            expect(turnstileObject.isUnlocked()).toBe(true);
            
            // Reference equality check
            expect(turnstileObject.getCurrentState()).toBe(turnstileObject.getUnlockedState());
        });
    });

    describe('matrix-based state machine features', () => {
        it('should have correct states and signals', () => {
            const states = turnstileObject.getAllStates();
            const signals = turnstileObject.getAllSignals();
            
            expect(states).toHaveLength(2);
            expect(signals).toHaveLength(2);
            expect(signals).toContain(TurnstileSignal.COIN);
            expect(signals).toContain(TurnstileSignal.PUSH);
        });

        it('should validate state and signal existence', () => {
            const lockedState = turnstileObject.getLockedState();
            const unlockedState = turnstileObject.getUnlockedState();
            
            expect(turnstileObject.hasState(lockedState)).toBe(true);
            expect(turnstileObject.hasState(unlockedState)).toBe(true);
            expect(turnstileObject.hasSignal(TurnstileSignal.COIN)).toBe(true);
            expect(turnstileObject.hasSignal(TurnstileSignal.PUSH)).toBe(true);
        });

        it('should return valid signals from current state', () => {
            // From locked state
            let validSignals = turnstileObject.getValidSignalsFromCurrentState();
            expect(validSignals).toEqual([TurnstileSignal.COIN]);
            expect(turnstileObject.isValidSignalFromCurrentState(TurnstileSignal.COIN)).toBe(true);
            expect(turnstileObject.isValidSignalFromCurrentState(TurnstileSignal.PUSH)).toBe(false);
            
            // Move to unlocked state
            turnstileObject.insertCoin();
            
            // From unlocked state
            validSignals = turnstileObject.getValidSignalsFromCurrentState();
            expect(validSignals).toEqual([TurnstileSignal.PUSH]);
            expect(turnstileObject.isValidSignalFromCurrentState(TurnstileSignal.COIN)).toBe(false);
            expect(turnstileObject.isValidSignalFromCurrentState(TurnstileSignal.PUSH)).toBe(true);
        });
    });

    describe('complete workflow scenarios', () => {
        it('should handle normal usage cycle with proper action execution', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            
            // Start: locked
            expect(turnstileObject.getCurrentStateString()).toBe('locked');
            
            // Insert coin: locked → unlocked
            turnstileObject.insertCoin();
            expect(turnstileObject.getCurrentStateString()).toBe('unlocked');
            expect(consoleSpy).toHaveBeenCalledWith("Processing payment - preparing to unlock...");
            expect(consoleSpy).toHaveBeenCalledWith("Turnstile is now UNLOCKED - passage allowed");
            
            consoleSpy.mockClear();
            
            // Push through: unlocked → locked
            turnstileObject.pushThrough();
            expect(turnstileObject.getCurrentStateString()).toBe('locked');
            expect(consoleSpy).toHaveBeenCalledWith("Person passing through - preparing to lock...");
            expect(consoleSpy).toHaveBeenCalledWith("Turnstile is now LOCKED - passage blocked");
        });

        it('should handle multiple coins without extra actions', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            
            // First coin: transition occurs
            turnstileObject.insertCoin();
            expect(consoleSpy).toHaveBeenCalledTimes(2); // beforeExit + afterEntry
            
            consoleSpy.mockClear();
            
            // Second coin: no transition, no actions
            turnstileObject.insertCoin();
            expect(consoleSpy).not.toHaveBeenCalled();
            
            // Third coin: no transition, no actions
            turnstileObject.insertCoin();
            expect(consoleSpy).not.toHaveBeenCalled();
            
            expect(turnstileObject.getCurrentStateString()).toBe('unlocked');
        });

        it('should handle multiple push attempts when locked', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            
            // Multiple push attempts - no transitions, no actions
            turnstileObject.pushThrough();
            turnstileObject.pushThrough();
            turnstileObject.pushThrough();
            
            expect(consoleSpy).not.toHaveBeenCalled();
            expect(turnstileObject.getCurrentStateString()).toBe('locked');
        });
    });

    describe('inheritance and interface compliance', () => {
        it('should extend MatrixBasedStateMachine', () => {
            expect(turnstileObject.getCurrentState).toBeDefined();
            expect(turnstileObject.sendSignal).toBeDefined();
            expect(turnstileObject.getMatrix).toBeDefined();
            expect(turnstileObject.printTransitionMatrix).toBeDefined();
        });

        it('should work with state objects implementing IStateWithActions', () => {
            const currentState = turnstileObject.getCurrentState();
            expect(currentState.afterEntryAction).toBeDefined();
            expect(currentState.beforeExitAction).toBeDefined();
            expect(currentState.toString).toBeDefined();
        });

        it('should maintain object identity for states', () => {
            const lockedState1 = turnstileObject.getLockedState();
            const lockedState2 = turnstileObject.getLockedState();
            
            // Should be the same object reference
            expect(lockedState1).toBe(lockedState2);
            
            const unlockedState1 = turnstileObject.getUnlockedState();
            const unlockedState2 = turnstileObject.getUnlockedState();
            
            // Should be the same object reference
            expect(unlockedState1).toBe(unlockedState2);
        });
    });

    describe('debugging and utility methods', () => {
        it('should provide string representation of current state', () => {
            expect(turnstileObject.getCurrentStateString()).toBe('locked');
            
            turnstileObject.insertCoin();
            expect(turnstileObject.getCurrentStateString()).toBe('unlocked');
            
            turnstileObject.pushThrough();
            expect(turnstileObject.getCurrentStateString()).toBe('locked');
        });

        it('should not throw when printing transition matrix', () => {
            expect(() => turnstileObject.printTransitionMatrix()).not.toThrow();
        });
    });

    describe('error handling and edge cases', () => {
        it('should handle rapid state changes with proper action execution', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            
            // Rapid transitions
            for (let i = 0; i < 5; i++) {
                turnstileObject.insertCoin();
                expect(turnstileObject.getCurrentStateString()).toBe('unlocked');
                
                turnstileObject.pushThrough();
                expect(turnstileObject.getCurrentStateString()).toBe('locked');
            }
            
            // Should have called actions for each actual transition
            // 5 cycles × 2 transitions × 2 actions = 20 total calls
            expect(consoleSpy).toHaveBeenCalledTimes(20);
        });

        it('should maintain state consistency with invalid operations', () => {
            const initialState = turnstileObject.getCurrentStateString();
            
            // Mix valid and invalid operations
            turnstileObject.sendSignal('invalid' as TurnstileSignal);
            turnstileObject.insertCoin();
            turnstileObject.sendSignal('another-invalid' as TurnstileSignal);
            turnstileObject.pushThrough();
            turnstileObject.sendSignal('yet-another-invalid' as TurnstileSignal);
            
            // Should be back to initial state
            expect(turnstileObject.getCurrentStateString()).toBe(initialState);
        });
    });
});