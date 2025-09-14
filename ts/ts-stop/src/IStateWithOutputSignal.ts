/*
    This interface represents a state that can produce an output signal of a specific type.
*/
export interface IStateWithOutputSignal<SIGNAL> {
    getOutputSignal(): SIGNAL;
}