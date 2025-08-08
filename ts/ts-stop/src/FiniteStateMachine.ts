/**
 * Interface defining the contract for a finite state machine.
 * 
 * @template STATE - The type representing possible states in the state machine
 * @template SIGNAL - The type representing signals/events that trigger state transitions
 */
interface IFiniteStateMachine<STATE, SIGNAL> {
    /**
     * Gets the current state of the state machine.
     * 
     * @returns The current state
     */
    getCurrentState(): STATE;
    
    /**
     * Sends a signal to the state machine to potentially trigger a state transition.
     * 
     * @param signal - The signal/event to process
     */
    sendSignal(signal: SIGNAL): void;
}

/**
 * Abstract base class implementing a finite state machine.
 * 
 * A finite state machine consists of:
 * - A finite set of states
 * - A finite set of signals (events/inputs)
 * - A set of transitions that define how signals move the machine between states
 * - A start state (initial state)
 * - A current state (tracks where the machine is now)
 * 
 * @template STATE - The type representing possible states
 * @template SIGNAL - The type representing signals/events
 */
abstract class FiniteStateMachine<STATE, SIGNAL> implements IFiniteStateMachine<STATE, SIGNAL> {
    /**
     * The current state of the state machine.
     * Private to ensure state changes only happen through sendSignal().
     */
    private currentState: STATE;

    /**
     * Creates a new finite state machine.
     * 
     * @param states - Array of all possible states
     * @param signals - Array of all possible signals/events
     * @param transitions - Array of transition rules defining how signals move between states
     * @param startState - The initial state of the machine
     */
    constructor(
        private states: STATE[], 
        private signals: SIGNAL[], 
        private transitions: { from: STATE; signal: SIGNAL; to: STATE }[], 
        private startState: STATE
    ) {
        // Initialize the machine to its starting state
        this.currentState = startState;
    }

    /**
     * Gets the current state of the state machine.
     * 
     * @returns The current state
     */
    getCurrentState(): STATE {
        return this.currentState;
    }

    /**
     * Processes a signal and potentially transitions to a new state.
     * 
     * Searches for a transition rule that matches:
     * - Current state (from)
     * - The provided signal
     * 
     * If a matching transition is found, the machine moves to the target state.
     * If no matching transition exists, the machine remains in its current state.
     * 
     * @param signal - The signal/event to process
     * @returns The resulting state after processing the signal (may be unchanged)
     */
sendSignal(signal: SIGNAL): STATE {
        // Find a transition that matches current state and signal
        const transition = this.transitions.find(t => 
            t.from === this.currentState && t.signal === signal
        );
        
        // If valid transition found, move to the target state
        if (transition) {
            this.currentState = transition.to;
        }
        
        // Return the current state (whether changed or not)
        return this.currentState;
    }
}

// Export both interface and class for external use
export { IFiniteStateMachine, FiniteStateMachine };