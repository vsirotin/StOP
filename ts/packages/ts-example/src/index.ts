import { StopLibrary, createStopInstance, transformState } from '@vsirotin/ts-stop';

/**
 * TypeScript Example demonstrating usage of @vsirotin/ts-stop library
 */

console.log('=== TypeScript StOP Example ===');

// Create a StOP instance using the class constructor
const stopInstance1 = new StopLibrary();
console.log('Instance 1:', stopInstance1.getGreeting());

// Create a StOP instance using the factory function
const stopInstance2 = createStopInstance("Hello from TypeScript Example!");
console.log('Instance 2:', stopInstance2.getGreeting());

// Demonstrate state processing
const initialState = {
    name: "TypeScript Demo",
    version: "1.0.0",
    active: true
};

console.log('\n=== State Processing Demo ===');
console.log('Initial state:', initialState);

const processedState = stopInstance2.processState(initialState);
console.log('Processed state:', processedState);

// Demonstrate state transformation
console.log('\n=== State Transformation Demo ===');
const transformedState = transformState(initialState, (state: any) => ({
    ...state,
    transformed: true,
    language: "TypeScript",
    transformedAt: new Date().toISOString()
}));

console.log('Transformed state:', transformedState);

// Update message and process again
stopInstance2.setMessage("Updated message from TypeScript!");
const finalState = stopInstance2.processState(transformedState);
console.log('\n=== Final State ===');
console.log('Final processed state:', finalState);

console.log('\nTypeScript example completed successfully!');
