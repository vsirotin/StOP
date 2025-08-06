"use strict";
/**
 * @vsirotin/ts-stop - State Oriented Programming Library
 *
 * A TypeScript library for implementing State Oriented Programming patterns.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachine = exports.StopLibrary = void 0;
exports.createStopInstance = createStopInstance;
exports.transformState = transformState;
class StopLibrary {
    constructor(message = "Hello from StOP TypeScript Library!") {
        this.message = message;
    }
    /**
     * Returns the greeting message
     */
    getGreeting() {
        return this.message;
    }
    /**
     * Sets a new message
     */
    setMessage(message) {
        this.message = message;
    }
    /**
     * Basic state operation (placeholder for future StOP functionality)
     */
    processState(state) {
        return Object.assign(Object.assign({}, state), { processed: true, timestamp: new Date().toISOString() });
    }
}
exports.StopLibrary = StopLibrary;
/**
 * Factory function to create a new StOP instance
 */
function createStopInstance(message) {
    return new StopLibrary(message);
}
/**
 * Utility function for state transformation
 */
function transformState(state, transformer) {
    return transformer(state);
}
// Export the new StateMachine class
var StateMachine_1 = require("./StateMachine");
Object.defineProperty(exports, "StateMachine", { enumerable: true, get: function () { return StateMachine_1.StateMachine; } });
// Default export
exports.default = StopLibrary;
//# sourceMappingURL=index.js.map