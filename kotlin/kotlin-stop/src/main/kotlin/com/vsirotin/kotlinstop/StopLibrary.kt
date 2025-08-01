package com.vsirotin.kotlinstop

import java.time.Instant

/**
 * Kotlin State Oriented Programming Library
 * 
 * This is a basic "Hello World" implementation that will be expanded
 * to include the full State Oriented Programming functionality.
 */
class StopLibrary(private var message: String = "Hello World from Kotlin StOP Library!") {
    
    /**
     * Returns the greeting message
     */
    fun getGreeting(): String = message
    
    /**
     * Sets a new message
     */
    fun setMessage(newMessage: String) {
        message = newMessage
    }
    
    /**
     * Basic state operation (placeholder for future StOP functionality)
     */
    fun processState(state: Map<String, Any>): Map<String, Any> {
        println("Processing state: $state")
        return state.toMutableMap().apply {
            put("processed", true)
            put("timestamp", Instant.now().toString())
            put("message", message)
        }
    }
    
    /**
     * Process state with type safety
     */
    inline fun <reified T> processTypedState(state: T, processor: (T) -> T): T {
        println("Processing typed state: $state")
        return processor(state)
    }
}

/**
 * Factory function to create a new StOP instance
 */
fun createStopInstance(message: String? = null): StopLibrary {
    return StopLibrary(message ?: "Hello World from Kotlin StOP Library!")
}

/**
 * Utility function for state transformation
 */
fun <T> transformState(state: T, transformer: (T) -> T): T {
    return transformer(state)
}

/**
 * Extension function for Any to add StOP processing capabilities
 */
fun <T> T.processWithStop(stopInstance: StopLibrary, processor: (T) -> T): T {
    println("Processing with StOP: $this")
    return processor(this)
}

/**
 * Data class representing a state container
 */
data class StateContainer<T>(
    val data: T,
    val metadata: Map<String, Any> = emptyMap(),
    val timestamp: String = Instant.now().toString()
) {
    fun withData(newData: T): StateContainer<T> = copy(data = newData)
    fun withMetadata(newMetadata: Map<String, Any>): StateContainer<T> = copy(metadata = newMetadata)
}
