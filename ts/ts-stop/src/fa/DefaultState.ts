/**
 * Marker base class for states that should be used processed by invalid signals and 
 * in situation, then no transitions set for pair (current signal, current state).
 * Only one state in a state machine can have this role.
 */
export abstract class DefaultState {
    isDefaultState(): boolean {
        return true;
    }
}