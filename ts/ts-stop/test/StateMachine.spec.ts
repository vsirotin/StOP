import { StateMachine } from '../src/StateMachine';

describe('StateMachine', () => {
    let stateMachine: StateMachine;

    beforeEach(() => {
        stateMachine = new StateMachine();
    });

    describe('getValue', () => {
        it('should return the number 5', () => {
            const result = stateMachine.getValue();
            expect(result).toBe(5);
        });

        it('should always return the same value', () => {
            const firstCall = stateMachine.getValue();
            const secondCall = stateMachine.getValue();
            
            expect(firstCall).toBe(secondCall);
            expect(firstCall).toBe(5);
            expect(secondCall).toBe(5);
        });

        it('should return a number type', () => {
            const result = stateMachine.getValue();
            expect(typeof result).toBe('number');
        });
    });

    describe('instantiation', () => {
        it('should create a StateMachine instance', () => {
            expect(stateMachine).toBeInstanceOf(StateMachine);
        });

        it('should be able to create multiple instances', () => {
            const machine1 = new StateMachine();
            const machine2 = new StateMachine();
            
            expect(machine1).toBeInstanceOf(StateMachine);
            expect(machine2).toBeInstanceOf(StateMachine);
            expect(machine1).not.toBe(machine2);
        });
    });
});