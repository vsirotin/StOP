import { FiniteStateMachine } from '../src/FiniteStateMachine';

/**
 * Turnstile finite state machine implementation.
 * 
 * This class models a classic turnstile (subway/metro gate) that:
 * - Starts in a "locked" state (blocking passage)
 * - Unlocks when a coin is inserted
 * - Locks again when someone pushes through
 * 
 * This is a common example in computer science for demonstrating
 * finite state machine concepts and state transitions.
 * 
 * State Diagram:
 * ```
 *   [locked] --coin--> [unlocked]
 *      ^                   |
 *      +------push---------+
 * ```
 * 
 * @example
 * ```typescript
 * const turnstile = new Turnstile();
 * console.log(turnstile.getCurrentState()); // "locked"
 * 
 * turnstile.sendSignal('coin');
 * console.log(turnstile.getCurrentState()); // "unlocked"
 * 
 * turnstile.sendSignal('push');
 * console.log(turnstile.getCurrentState()); // "locked"
 * ```
 */
export class Turnstile extends FiniteStateMachine<string, string> {
    /**
     * Creates a new turnstile in the locked state.
     * 
     * Initializes the finite state machine with:
     * - **States**: "locked" (blocks passage), "unlocked" (allows passage)
     * - **Signals**: "coin" (payment inserted), "push" (person passes through)
     * - **Transitions**: 
     *   - locked + coin → unlocked (payment unlocks the gate)
     *   - unlocked + push → locked (passage locks the gate again)
     * - **Start State**: "locked" (turnstile starts secure)
     * 
     * @remarks
     * This implementation uses string literals for both states and signals,
     * making it simple but less type-safe than using enums or union types.
     */
    constructor() {
        super(
            ['locked', 'unlocked'], // All possible states: secure or open
            ['coin', 'push'],       // All possible signals: payment or passage
            [                       // State transition rules
                // When locked, inserting a coin unlocks the turnstile
                { from: 'locked', signal: 'coin', to: 'unlocked' },
                // When unlocked, pushing through locks the turnstile again
                { from: 'unlocked', signal: 'push', to: 'locked' }
            ],
            'locked'                // Initial state: secure and blocking passage
        );
    }

    /**
     * Processes a coin insertion signal.
     * 
     * Convenience method that sends a 'coin' signal to the state machine.
     * If the turnstile is locked, it will transition to unlocked.
     * If already unlocked, the state remains unchanged.
     * 
     * @returns The resulting state after processing the coin
     */
    insertCoin(): string {
        return this.sendSignal('coin');
    }

    /**
     * Processes a push/passage signal.
     * 
     * Convenience method that sends a 'push' signal to the state machine.
     * If the turnstile is unlocked, it will transition to locked.
     * If already locked, the state remains unchanged (blocked passage).
     * 
     * @returns The resulting state after attempting to push through
     */
    pushThrough(): string {
        return this.sendSignal('push');
    }

    /**
     * Checks if the turnstile is currently locked.
     * 
     * @returns true if the turnstile is in the "locked" state, false otherwise
     */
    isLocked(): boolean {
        return this.getCurrentState() === 'locked';
    }

    /**
     * Checks if the turnstile is currently unlocked and allows passage.
     * 
     * @returns true if the turnstile is in the "unlocked" state, false otherwise
     */
    isUnlocked(): boolean {
        return this.getCurrentState() === 'unlocked';
    }
}