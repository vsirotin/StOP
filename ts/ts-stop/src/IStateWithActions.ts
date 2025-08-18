/**
 * Interface for states that have an action after entry.
 */
interface IStateWithAfterEntryAction {
    afterEntryAction: () => void;
}
/**
 * Interface for states that have an action before exit.
 */
interface IStateWithBeforeExitAction {
    beforeExitAction: () => void;
}
/**
 * Interface combining both entry and exit actions.
 */
export interface IStateWithActions extends IStateWithAfterEntryAction, IStateWithBeforeExitAction { }
