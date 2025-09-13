/**
 * Marker interface for states that should handle invalid signals as default behavior.
 * Only one state in a state machine can implement this interface.
 * States implementing this interface will have their actions executed when invalid signals are received.
 */
export abstract class DefaultState {
    isDefaultState(): boolean {
        return true;
    }
}