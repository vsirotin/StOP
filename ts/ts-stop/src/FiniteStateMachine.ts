import { DefaultState } from './DefaultState';
import { IStateWithAfterEntryAction, IStateWithBeforeExitAction } from './IStateWithActions';
import { IStateWithOutputSignal } from './IStateWithOutputSigmal';

/**
 * Represents a transition in a finite state machine.
 * 
 * @template STATE - The type representing possible states
 * @template SIGNAL - The type representing signals/events
 */
export interface ITransition<STATE, SIGNAL> {
    from: STATE;
    signal: SIGNAL;
    to: STATE;
}

/**
 * Interface defining the contract for a finite state machine.
 * 
 * @template STATE - The type representing possible states in the state machine
 * @template SIGNAL - The type representing signals/events that trigger state transitions
 */
export interface IFiniteStateMachine<STATE> {
    /**
     * Gets the current state of the state machine.
     * 
     * @returns The current state
     */
    getCurrentState(): STATE;
    
}

/**
 * Concrete implementation of a finite state machine with optional state actions.
 * 
 * This class supports states that can optionally implement action interfaces:
 * - IStateWithAfterEntryAction: Execute action when entering the state
 * - IStateWithBeforeExitAction: Execute action when exiting the state
 * - Both interfaces: Execute both entry and exit actions
 * - Neither interface: Traditional state machine behavior (no actions)
 * 
 * @template STATE - The type representing possible states
 * @template SIGNAL - The type representing signals/events
 * 
 * @example
 * ```typescript
 * // Basic string-based turnstile (traditional approach)
 * class Turnstile extends FiniteStateMachine<string, string> {
 *     constructor() {
 *         super(
 *             ['locked', 'unlocked'],
 *             ['coin', 'push'],
 *             [
 *                 { from: 'locked', signal: 'coin', to: 'unlocked' },
 *                 { from: 'unlocked', signal: 'push', to: 'locked' }
 *             ],
 *             'locked'
 *         );
 *     }
 * 
 * ...
 * }
 * 
 
 * 
 * class TurnstileWithActions extends FiniteStateMachine<ActionState, string> {
 *     private locked = new ActionState('locked', 'Payment required');
 *     private unlocked = new ActionState('unlocked', 'Please proceed');
 * 
 *     constructor() {
 *         super(
 *             [this.locked, this.unlocked],
 *             ['coin', 'push'],
 *             [
 *                 { from: this.locked, signal: 'coin', to: this.unlocked },
 *                 { from: this.unlocked, signal: 'push', to: this.locked }
 *             ],
 *             this.locked
 *         );
 *     }
 * 
 *     insertCoin(): ActionState { return this.sendSignal('coin'); }
 *     pushThrough(): ActionState { return this.sendSignal('push'); }
 * }
 * 
 * ```
 */
export abstract class FiniteStateMachine<STATE, SIGNAL> implements IFiniteStateMachine<STATE> {
    /**
     * The current state of the state machine.
     * Protected to allow subclass access while maintaining encapsulation.
     */
    protected currentState: STATE;

        /**
     * The default state that handles invalid signals.
     * Set to null if no state implements IDefaultState.
     */
    private defaultState: DefaultState | null = null;

    /**
     * Creates a new finite state machine.
     * 
     * @param states - Array of all possible states
     * @param signals - Array of all possible signals/events
     * @param transitions - Array of transition rules defining how signals move between states
     * @param startState - The initial state of the machine
     */
    constructor(
        protected states: STATE[], 
        protected signals: SIGNAL[], 
        protected transitions: ITransition<STATE, SIGNAL>[], 
        protected startState: STATE
    ) {
           // Find states that implement IDefaultState
    const defaultStates = states.filter(state => this.isDefaultState(state));
    
        // Validate default state count
        if (defaultStates.length > 1) {
            throw new Error(
                `Multiple states implement IDefaultState interface. ` +
                `Only one state can handle invalid signals. ` +
                `Found ${defaultStates.length} states with IDefaultState.`
            );
        }
        
        // Set default state if exactly one found
        if (defaultStates.length === 1) {
            this.defaultState = defaultStates[0] as DefaultState;
        }

        // Initialize the machine to its starting state
        this.currentState = startState;
        
        // Execute initial state entry action if supported
        this.executeEntryAction(startState);
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
     * Processes a signal and potentially transitions to a new state with action execution.
     * 
     * This method:
     * 1. Finds a matching transition for the current state and signal
     * 2. If found and the target state is different:
     *    a. Executes beforeExitAction on current state (if implemented)
     *    b. Changes to the new state
     *    c. Executes afterEntryAction on new state (if implemented)
     * 3. Returns the resulting state
     * 
     * @param signal - The signal/event to process
     * @returns The resulting state after processing the signal
     */
    protected sendSignal(signal: SIGNAL): STATE {
        // Find a transition that matches current state and signal
        const transition = this.transitions.find(t => 
            t.from === this.currentState && t.signal === signal
        );
        
        // If valid transition found, handle state change with actions
        if (transition) {
            this.executeStateTransition(transition);
        } else if (this.defaultState) {
            // No valid transition found, but default state exists
            // Execute default state's actions (entry/exit if implemented)
            this.executeStateActions(this.defaultState as STATE);
            // Current state remains unchanged
        }
        
        if(this.isStateWithOutputSignal(this.currentState)){ 
            // Processing of behaviour for state with inside calculated output signal
            this.executeStateActions(this.currentState);
            const stateWithOutputSignal = this.currentState as IStateWithOutputSignal<SIGNAL>;
            const outputSignal = stateWithOutputSignal.getOutputSignal();
            this.sendSignal(outputSignal);
        }

        return this.currentState;
    }

    private isStateWithOutputSignal<S>(state: STATE): boolean {   
        const obj = state as any;
        return (
            typeof obj === 'object' &&
            obj !== null &&
            typeof obj.getOutputSignal === 'function'
        );
}

    private executeStateTransition(transition: ITransition<STATE, SIGNAL>) {
        const oldState = this.currentState;
        const newState = transition.to;

        // Only execute actions if there's an actual state change
        if (oldState !== newState) {
            // Execute before exit action on current state
            this.executeExitAction(oldState);

            // Change state
            this.currentState = newState;

            // Execute after entry action on new state
            this.executeEntryAction(newState);
        }
    }

    private executeStateActions(state: STATE) {
        this.executeEntryAction(state);
        this.executeExitAction(state);
    }

    /**
     * Type guard to check if a state is an instance of DefaultState class.
     * 
     * @param state - The state to check
     * @returns true if the state is an instance of DefaultState
     */
    protected isDefaultState(state: STATE): boolean {
        return state instanceof DefaultState;
    }

    /**
     * Type guard to check if a state implements IStateWithAfterEntryAction.
     * 
     * @param state - The state to check
     * @returns true if the state implements afterEntryAction method
     */
    protected hasAfterEntryAction(state: STATE): state is STATE & IStateWithAfterEntryAction {
        return typeof state === 'object' && 
               state !== null && 
               'afterEntryAction' in state && 
               typeof (state as any).afterEntryAction === 'function';
    }

    /**
     * Type guard to check if a state implements IStateWithBeforeExitAction.
     * 
     * @param state - The state to check
     * @returns true if the state implements beforeExitAction method
     */
    protected hasBeforeExitAction(state: STATE): state is STATE & IStateWithBeforeExitAction {
        return typeof state === 'object' && 
               state !== null && 
               'beforeExitAction' in state && 
               typeof (state as any).beforeExitAction === 'function';
    }

    /**
     * Executes the afterEntryAction on a state if it implements IStateWithAfterEntryAction.
     * 
     * @param state - The state to execute the entry action on
     */
    private executeEntryAction(state: STATE): void {
        if (this.hasAfterEntryAction(state)) {
            state.afterEntryAction();
        }
    }

    /**
     * Executes the beforeExitAction on a state if it implements IStateWithBeforeExitAction.
     * 
     * @param state - The state to execute the exit action on
     */
    private executeExitAction(state: STATE): void {
        if (this.hasBeforeExitAction(state)) {
            state.beforeExitAction();
        }
    }

    /**
     * Gets all possible states.
     * 
     * @returns Array of all states
     */
    getAllStates(): STATE[] {
        return [...this.states];
    }

    /**
     * Gets all possible signals.
     * 
     * @returns Array of all signals
     */
    getAllSignals(): SIGNAL[] {
        return [...this.signals];
    }

    /**
     * Checks if a given signal is valid from the current state.
     * 
     * @param signal - The signal to check
     * @returns true if the signal can trigger a transition from the current state
     */
    isValidSignalFromCurrentState(signal: SIGNAL): boolean {
        return this.transitions.some(
            t => t.from === this.currentState && t.signal === signal
        );
    }

    /**
     * Gets all valid signals from the current state.
     * 
     * @returns Array of signals that can trigger transitions from the current state
     */
    getValidSignalsFromCurrentState(): SIGNAL[] {
        return this.transitions
            .filter(t => t.from === this.currentState)
            .map(t => t.signal);
    }

    /**
     * Gets all transitions.
     * 
     * @returns Array of all transitions
     */
    getTransitions(): ITransition<STATE, SIGNAL>[] {
        return [...this.transitions];
    }

    /**
     * Checks if a signal is valid in the state machine.
     * @param signal - The signal to check
     * @returns True if the signal is valid, false otherwise.
     */
    hasSignal(signal: SIGNAL): boolean {
        return this.getAllSignals().includes(signal);
    }

    /**
     * Checks if a given state exists in the state machine.
     * 
     * @param state - The state to check
     * @returns true if the state exists, false otherwise
     */
    hasState(state: STATE): boolean {
        return this.getAllStates().includes(state);
    }
    
        /**
     * Gets the default state that handles invalid signals.
     * 
     * @returns The default state or null if none exists
     */
    getDefaultState(): DefaultState | null {
        return this.defaultState;
    }
    
    /**
     * Checks if the state machine has a default state.
     * 
     * @returns true if a default state exists
     */
    hasDefaultState(): boolean {
        return this.defaultState !== null;
    }
}
     
