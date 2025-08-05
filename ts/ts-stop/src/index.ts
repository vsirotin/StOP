/**
 * @vsirotin/ts-stop - State Oriented Programming Library
 * 
 * A TypeScript library for implementing State Oriented Programming patterns.
 */

export class StopLibrary {
    private message: string;

    constructor(message: string = "Hello from StOP TypeScript Library!") {
        this.message = message;
    }

    /**
     * Returns the greeting message
     */
    public getGreeting(): string {
        return this.message;
    }

    /**
     * Sets a new message
     */
    public setMessage(message: string): void {
        this.message = message;
    }

    /**
     * Basic state operation (placeholder for future StOP functionality)
     */
    public processState(state: any): any {
        return {
            ...state,
            processed: true,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Factory function to create a new StOP instance
 */
export function createStopInstance(message?: string): StopLibrary {
    return new StopLibrary(message);
}

/**
 * Utility function for state transformation
 */
export function transformState<T>(state: T, transformer: (state: T) => T): T {
    return transformer(state);
}

// Export the new StateMachine class
export { StateMachine } from './StateMachine';

// Default export
export default StopLibrary;
