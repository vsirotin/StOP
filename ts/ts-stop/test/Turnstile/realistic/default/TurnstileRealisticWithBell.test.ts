import { TurnstileRealisticWithBell } from './TurnstileRealisticWithBell';
import { LockedStateRealistic } from '../states/LockedStateRealistic';
import { UnlockedStateRealistic } from '../states/UnlockedStateRealistic';
import { Bell } from '../devices/Bell';
import { ErrorAttemptState } from '../states/ErrorAttemptState';

describe('TurnstileRealisticWithBell - ErrorAttemptState Tests', () => {
    let turnstile: TurnstileRealisticWithBell;
    let errorState: ErrorAttemptState;
    let bell: Bell;

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
            bell = errorState.bell;
        }
    });

    afterEach(() => {
        bell.resetRingsCount();
    });

    describe('Default State Behavior - ErrorAttemptState', () => {
        test('should have ErrorAttemptState as default state', () => {
            expect(errorState).toBeInstanceOf(ErrorAttemptState);
        });

        test('should have bell instance', () => {
            expect(bell).toBeInstanceOf(Bell);
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
            expect(bell.getRingsCount()).toBe(1);
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
             expect(bell.getRingsCount()).toBe(1);
        });


        test('should handle multiple consecutive invalid operations', () => {
            // Multiple invalid pushes while locked
            turnstile.pushThrough();
            turnstile.pushThrough();
            turnstile.pushThrough();
            
            // Should remain locked after all invalid attempts
            expect(isLocked()).toBe(true);
            
            // Bell should have rung 3 times
              expect(bell.getRingsCount()).toBe(3);
            
        });

        test('should not ring bell for valid operations', () => {
            
            // Valid operation: insert coin while locked
            turnstile.insertCoin();
            expect(isUnlocked()).toBe(true);
            
            // Valid operation: push while unlocked
            turnstile.pushThrough();
            expect(isLocked()).toBe(true);
            
            // Should NOT have triggered bell for valid operations
            expect(bell.getRingsCount()).toBe(0);
            
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
            expect(bell.getRingsCount()).toBe(2);
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
            expect(bell.getRingsCount()).toBe(4);
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
    });
});