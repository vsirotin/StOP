/**
 * @vsirotin/ts-stop - TypeScript State Oriented Programming Library
 * 
 * This is a basic "Hello World" implementation that will be expanded
 * to include the full State Oriented Programming functionality.
 */

export class StopLibrary {
    private message: string;

    constructor(message: string = "Hello World from TypeScript StOP Library!") {
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
        console.log("Processing state:", state);
        return {
            ...state,
            processed: true,
            timestamp: new Date().toISOString(),
            message: this.message
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
export function transformState(state: any, transformer: (state: any) => any): any {
    return transformer(state);
}

// Default export
export default StopLibrary;
