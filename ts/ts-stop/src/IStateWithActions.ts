/**
 * Interface for states that have an action after entry.
 */
export interface IStateWithAfterEntryAction {
    afterEntryAction: () => void;
}
/**
 * Interface for states that have an action before exit.
 */
export interface IStateWithBeforeExitAction {
    beforeExitAction: () => void;
}
/**
 * Interface combining both entry and exit actions.
 */
export interface IStateWithActions extends IStateWithAfterEntryAction, IStateWithBeforeExitAction { }
