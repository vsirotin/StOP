import { FiniteStateMachine } from '../../../src/FiniteStateMachine';
import { ITurnstile } from './ITurnstile';

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
 * ```
 */
export class TurnstileBase extends FiniteStateMachine<string, string> implements ITurnstile<string> {
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
     * making it simple but less type-safe than using enums or object types.
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
     * 
     * Simulate inserting a coin into the turnstile.
     * 
     * @remarks
     * This is a convenience method that sends the "coin" signal to the state machine,
     * triggering a state transition if valid (from "locked" to "unlocked").
     * 
     * If the turnstile is already "unlocked", sending this signal has no effect.
     * @returns The resulting state after inserting coin
     */
    insertCoin(): string { 
        return this.sendSignal('coin'); 
    }

    /*
     * Simulate pushing through the turnstile.
     * 
     * @remarks
     * This is a convenience method that sends the "push" signal to the state machine,
     * triggering a state transition if valid (from "unlocked" to "locked").
     * 
     * If the turnstile is already "locked", sending this signal has no effect.
     * @returns The resulting state after pushing through
     */
    pushThrough(): string { 
        return this.sendSignal('push'); 
    }
}