package com.vsirotin.kotlinexample

import com.vsirotin.kotlinstop.*

/**
 * Kotlin Example demonstrating usage of Kotlin StOP library
 */

data class DemoState(
    val name: String,
    val version: String,
    val active: Boolean,
    val language: String = "Kotlin"
)

fun main() {
    println("=== Kotlin StOP Example ===")
    
    // Create a StOP instance using the class constructor
    val stopInstance1 = StopLibrary()
    println("Instance 1: ${stopInstance1.getGreeting()}")
    
    // Create a StOP instance using the factory function
    val stopInstance2 = createStopInstance("Hello from Kotlin Example!")
    println("Instance 2: ${stopInstance2.getGreeting()}")
    
    // Demonstrate state processing with Map
    val initialState = mapOf(
        "name" to "Kotlin Demo",
        "version" to "1.0.0",
        "active" to true,
        "language" to "Kotlin"
    )
    
    println("\n=== State Processing Demo ===")
    println("Initial state: $initialState")
    
    val processedState = stopInstance2.processState(initialState)
    println("Processed state: $processedState")
    
    // Demonstrate state transformation with data class
    println("\n=== Data Class State Demo ===")
    val demoState = DemoState(
        name = "Kotlin Advanced Demo",
        version = "2.0.0", 
        active = true
    )
    
    println("Demo state: $demoState")
    
    val transformedState = transformState(demoState) { state ->
        state.copy(
            version = "2.1.0",
            active = false
        )
    }
    
    println("Transformed state: $transformedState")
    
    // Demonstrate typed state processing
    println("\n=== Typed State Processing Demo ===")
    val typedProcessedState = stopInstance2.processTypedState(demoState) { state ->
        state.copy(name = "Processed ${state.name}")
    }
    
    println("Typed processed state: $typedProcessedState")
    
    // Demonstrate extension function
    println("\n=== Extension Function Demo ===")
    val extProcessedState = demoState.processWithStop(stopInstance2) { state ->
        state.copy(
            name = "Extended ${state.name}",
            version = "3.0.0"
        )
    }
    
    println("Extension processed state: $extProcessedState")
    
    // Demonstrate StateContainer
    println("\n=== State Container Demo ===")
    val stateContainer = StateContainer(
        data = demoState,
        metadata = mapOf(
            "creator" to "Kotlin Example",
            "type" to "demo"
        )
    )
    
    println("State container: $stateContainer")
    
    val updatedContainer = stateContainer
        .withData(demoState.copy(name = "Container Demo"))
        .withMetadata(mapOf("updated" to true))
    
    println("Updated container: $updatedContainer")
    
    // Update message and demonstrate final processing
    stopInstance2.setMessage("Updated message from Kotlin!")
    val finalState = stopInstance2.processState(
        mapOf(
            "final" to true,
            "demo" to transformedState
        )
    )
    
    println("\n=== Final State ===")
    println("Final processed state: $finalState")
    
    println("\nKotlin example completed successfully!")
}
