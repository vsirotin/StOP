const { StopLibrary, createStopInstance, transformState } = require('@vsirotin/ts-stop');

/**
 * JavaScript Example demonstrating usage of @vsirotin/ts-stop library
 */

console.log('=== JavaScript StOP Example ===');

// Create a StOP instance using the class constructor
const stopInstance1 = new StopLibrary();
console.log('Instance 1:', stopInstance1.getGreeting());

// Create a StOP instance using the factory function
const stopInstance2 = createStopInstance("Hello from JavaScript Example!");
console.log('Instance 2:', stopInstance2.getGreeting());

// Demonstrate state processing
const initialState = {
    name: "JavaScript Demo",
    version: "1.0.0",
    active: true,
    language: "JavaScript"
};

console.log('\n=== State Processing Demo ===');
console.log('Initial state:', initialState);

const processedState = stopInstance2.processState(initialState);
console.log('Processed state:', processedState);

// Demonstrate state transformation
console.log('\n=== State Transformation Demo ===');
const transformedState = transformState(initialState, (state) => {
    return {
        ...state,
        transformed: true,
        runtime: "Node.js",
        transformedAt: new Date().toISOString()
    };
});

console.log('Transformed state:', transformedState);

// Update message and process again
stopInstance2.setMessage("Updated message from JavaScript!");
const finalState = stopInstance2.processState(transformedState);
console.log('\n=== Final State ===');
console.log('Final processed state:', finalState);

// Demonstrate multiple instances
console.log('\n=== Multiple Instances Demo ===');
const instances = [
    createStopInstance("Instance A"),
    createStopInstance("Instance B"), 
    createStopInstance("Instance C")
];

instances.forEach((instance, index) => {
    console.log(`Instance ${index + 1}:`, instance.getGreeting());
});

console.log('\nJavaScript example completed successfully!');
