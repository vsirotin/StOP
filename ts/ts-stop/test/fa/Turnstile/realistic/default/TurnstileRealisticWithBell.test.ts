import { TurnstileRealisticWithBell } from './TurnstileRealisticWithBell';
import { LockedStateRealistic } from '../states/LockedStateRealistic';
import { UnlockedStateRealistic } from '../states/UnlockedStateRealistic';
import { Buzzer } from '../devices/Buzzer';
import { ErrorAttemptState } from '../states/ErrorAttemptState';

describe('TurnstileRealisticWithBell - ErrorAttemptState Tests', () => {
    let turnstile: TurnstileRealisticWithBell;
    let errorState: ErrorAttemptState;
    let bell: Buzzer;

    function isLocked(): boolean {
        return turnstile.getCurrentState() instanceof LockedStateRealistic;
    }

    function isUnlocked(): boolean {
        return turnstile.getCurrentState() instanceof UnlockedStateRealistic;
    }

    beforeEach(() => {
        turnstile = new TurnstileRealisticWithBell();
        errorState = turnstile.getDefaultState() as ErrorAttemptState;
        if (errorState) {
            bell = errorState.buzzer;
        }
    });

    afterEach(() => {
        bell.reset();
    });

    describe('Default State Behavior - ErrorAttemptState', () => {
        test('should have ErrorAttemptState as default state', () => {
            expect(errorState).toBeInstanceOf(ErrorAttemptState);
        });

        test('should have bell instance', () => {
            expect(bell).toBeInstanceOf(Buzzer);
        });

        test('should ring bell when pushing while locked (invalid operation)', () => {
            // Ensure we start in locked state
            expect(isLocked()).toBe(true);
            
            // Try invalid operation: push while locked
            const resultState = turnstile.pushThrough();
            
            // Should remain in locked state
            expect(isLocked()).toBe(true);
            expect(resultState).toBeInstanceOf(LockedStateRealistic);
            
            // Should have triggered bell and error message
            expect(bell.getBuzzCount()).toBe(1);
        });

        test('should ring bell when inserting coin while unlocked (invalid operation)', () => {
            // First unlock the turnstile
            turnstile.insertCoin();
            expect(isUnlocked()).toBe(true);
        
            
            // Try invalid operation: insert coin while unlocked
            const resultState = turnstile.insertCoin();
            
            // Should remain in unlocked state
            expect(isUnlocked()).toBe(true);
            expect(resultState).toBeInstanceOf(UnlockedStateRealistic);
            
            // Should have triggered bell and error message
             expect(bell.getBuzzCount()).toBe(1);
        });


        test('should handle multiple consecutive invalid operations', () => {
            // Multiple invalid pushes while locked
            turnstile.pushThrough();
            turnstile.pushThrough();
            turnstile.pushThrough();
            
            // Should remain locked after all invalid attempts
            expect(isLocked()).toBe(true);
            
            // Bell should have rung 3 times
              expect(bell.getBuzzCount()).toBe(3);
            
        });

        test('should not ring bell for valid operations', () => {
            
            // Valid operation: insert coin while locked
            turnstile.insertCoin();
            expect(isUnlocked()).toBe(true);
            
            // Valid operation: push while unlocked
            turnstile.pushThrough();
            expect(isLocked()).toBe(true);
            
            // Should NOT have triggered bell for valid operations
            expect(bell.getBuzzCount()).toBe(0);
            
        });

        test('should alternate between valid and invalid operations correctly', () => {
            
            // Valid: insert coin (locked → unlocked)
            turnstile.insertCoin();
            expect(isUnlocked()).toBe(true);
            
            // Invalid: insert coin again (unlocked → unlocked)
            turnstile.insertCoin();
            expect(isUnlocked()).toBe(true);
            
            // Valid: push through (unlocked → locked)
            turnstile.pushThrough();
            expect(isLocked()).toBe(true);
            
            // Invalid: push again (locked → locked)
            turnstile.pushThrough();
            expect(isLocked()).toBe(true);
            
            // Should have exactly 2 bell rings (for the 2 invalid operations)
            expect(bell.getBuzzCount()).toBe(2);
        });

        test('should maintain state machine integrity after error attempts', () => {
            // Start locked
            expect(isLocked()).toBe(true);
            
            // Multiple invalid attempts
            turnstile.pushThrough(); // Invalid
            turnstile.pushThrough(); // Invalid
            expect(isLocked()).toBe(true);
            
            // Should still work normally after errors
            turnstile.insertCoin(); // Valid
            expect(isUnlocked()).toBe(true);
            
            // More invalid attempts
            turnstile.insertCoin(); // Invalid
            turnstile.insertCoin(); // Invalid
            expect(isUnlocked()).toBe(true);
            
            // Should still work normally after errors
            turnstile.pushThrough(); // Valid
            expect(isLocked()).toBe(true);
            
            // Final verification: 4 invalid operations total
            expect(bell.getBuzzCount()).toBe(4);
        });
    });

    describe('ErrorAttemptState State Information', () => {

        test('should verify that error state does not change current state', () => {
            // Track state before and after error
            const stateBefore = turnstile.getCurrentState();
            const isLockedBefore = isLocked();
            
            // Trigger error
            turnstile.pushThrough();
            
            // State should be identical
            const stateAfter = turnstile.getCurrentState();
            const isLockedAfter = isLocked();
            
            expect(stateAfter).toBe(stateBefore);
            expect(isLockedAfter).toBe(isLockedBefore);
        });

        test('should verify afterEntryAction is NOT called when staying in same state after error', () => {
            // Mock afterEntryAction to track calls
            const originalAfterEntryAction = turnstile.getCurrentState().afterEntryAction;
            const afterEntryActionSpy = jest.fn();
            turnstile.getCurrentState().afterEntryAction = afterEntryActionSpy;
            
            // Clear any previous calls
            afterEntryActionSpy.mockClear();
            
            // 1) Verify we're in a normal state (LockedStateRealistic)
            expect(isLocked()).toBe(true);
            expect(turnstile.getCurrentState()).toBeInstanceOf(LockedStateRealistic);
            
            // 2) Send unmatched signal (push while locked) - should trigger error state
            const stateBefore = turnstile.getCurrentState();
            turnstile.pushThrough();
            
            // 3) Verify FA automatically stays in state A and afterEntryAction is NOT called
            const stateAfter = turnstile.getCurrentState();
            expect(stateAfter).toBe(stateBefore); // Same instance
            expect(isLocked()).toBe(true); // Still locked
            expect(afterEntryActionSpy).not.toHaveBeenCalled(); // afterEntryAction NOT called
            
            // Verify error state was triggered (bell rang)
            expect(bell.getBuzzCount()).toBe(1);
            
            // Restore original method
            turnstile.getCurrentState().afterEntryAction = originalAfterEntryAction;
        });

        test('should verify afterEntryAction IS called when actually transitioning to a new state', () => {
            // Start in locked state
            expect(isLocked()).toBe(true);
            
            // Get the unlocked state that we'll transition to
            turnstile.insertCoin(); // Transition to unlocked
            const unlockedState = turnstile.getCurrentState();
            expect(isUnlocked()).toBe(true);
            
            // Go back to locked for the test
            turnstile.pushThrough();
            expect(isLocked()).toBe(true);
            
            // Mock afterEntryAction on the unlocked state
            const afterEntryActionSpy = jest.fn();
            unlockedState.afterEntryAction = afterEntryActionSpy;
            
            // Now transition to unlocked state - this should call afterEntryAction
            turnstile.insertCoin();
            expect(isUnlocked()).toBe(true);
            expect(afterEntryActionSpy).toHaveBeenCalledTimes(1);
            
            // Verify no bell was triggered for valid operation
            expect(bell.getBuzzCount()).toBe(0);
        });
    });
});