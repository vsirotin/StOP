// const { StopLibrary, createStopInstance, transformState } = require('@vsirotin/ts-stop');

// /**
//  * JavaScript Example demonstrating usage of @vsirotin/ts-stop library
//  */

// console.log('=== JavaScript StOP Example ===');

// // Create a StOP instance using the class constructor
// const stopInstance1 = new StopLibrary();
// console.log('Instance 1:', stopInstance1.getGreeting());

// // Create a StOP instance using the factory function
// const stopInstance2 = createStopInstance("Hello from JavaScript Example!");
// console.log('Instance 2:', stopInstance2.getGreeting());

// // Demonstrate state processing
// const initialState = {
//     name: "JavaScript Demo",
//     version: "1.0.0",
//     active: true
// };

// console.log('=== State Processing Demo ===');
// console.log('Initial state:', initialState);

// const processedState = stopInstance2.processState(initialState);
// console.log('Processed state:', processedState);

// // Demonstrate state transformation
// console.log('=== State Transformation Demo ===');
// const transformedState = transformState(initialState, (state) => ({
//     ...state,
//     transformed: true,
//     language: "JavaScript",
//     transformedAt: new Date().toISOString()
// }));

// console.log('Transformed state:', transformedState);

// console.log('=== JavaScript Example Completed ===');
