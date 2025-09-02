/**
 * Marker interface for states that should handle invalid signals as default behavior.
 * Only one state in a state machine can implement this interface.
 * States implementing this interface will have their actions executed when invalid signals are received.
 */
export interface IDefaultState {
    // This is a marker interface - no methods required
    // States can implement this along with IStateWithAfterEntryAction and/or IStateWithBeforeExitAction
    isDefaultState(): boolean;
}