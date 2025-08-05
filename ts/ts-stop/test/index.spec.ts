import { StopLibrary, createStopInstance, transformState, StateMachine } from '../src/index';

describe('ts-stop library', () => {
    describe('StopLibrary', () => {
        it('should create an instance with default message', () => {
            const lib = new StopLibrary();
            expect(lib.getGreeting()).toBe("Hello from StOP TypeScript Library!");
        });

        it('should create an instance with custom message', () => {
            const lib = new StopLibrary("Custom message");
            expect(lib.getGreeting()).toBe("Custom message");
        });
    });

    describe('createStopInstance', () => {
        it('should create a StopLibrary instance', () => {
            const instance = createStopInstance();
            expect(instance).toBeInstanceOf(StopLibrary);
        });
    });

    describe('transformState', () => {
        it('should transform state using provided function', () => {
            const initialState = { count: 1 };
            const transformed = transformState(initialState, (state: any) => ({
                ...state,
                count: state.count + 1
            }));
            
            expect(transformed.count).toBe(2);
        });
    });

    describe('StateMachine export', () => {
        it('should export StateMachine class', () => {
            const machine = new StateMachine();
            expect(machine).toBeInstanceOf(StateMachine);
            expect(machine.getValue()).toBe(5);
        });
    });
});