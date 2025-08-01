package com.vsirotin.javaexample;

import com.vsirotin.kotlinstop.StopLibrary;
import com.vsirotin.kotlinstop.StopLibraryKt;
import com.vsirotin.kotlinstop.StateContainer;
import kotlin.jvm.functions.Function1;

import java.util.HashMap;
import java.util.Map;

/**
 * Java Example demonstrating usage of Kotlin StOP library from Java
 */
public class Main {
    
    public static void main(String[] args) {
        System.out.println("=== Java StOP Example ===");
        
        // Create a StOP instance using the class constructor
        StopLibrary stopInstance1 = new StopLibrary();
        System.out.println("Instance 1: " + stopInstance1.getGreeting());
        
        // Create a StOP instance using the factory function
        StopLibrary stopInstance2 = StopLibraryKt.createStopInstance("Hello from Java Example!");
        System.out.println("Instance 2: " + stopInstance2.getGreeting());
        
        // Demonstrate state processing with Map
        Map<String, Object> initialState = new HashMap<>();
        initialState.put("name", "Java Demo");
        initialState.put("version", "1.0.0");
        initialState.put("active", true);
        initialState.put("language", "Java");
        
        System.out.println("\n=== State Processing Demo ===");
        System.out.println("Initial state: " + initialState);
        
        Map<String, Object> processedState = stopInstance2.processState(initialState);
        System.out.println("Processed state: " + processedState);
        
        // Demonstrate state transformation
        System.out.println("\n=== State Transformation Demo ===");
        
        Function1<Map<String, Object>, Map<String, Object>> transformer = state -> {
            Map<String, Object> newState = new HashMap<>(state);
            newState.put("transformed", true);
            newState.put("runtime", "JVM");
            newState.put("transformedBy", "Java");
            return newState;
        };
        
        Map<String, Object> transformedState = StopLibraryKt.transformState(initialState, transformer);
        System.out.println("Transformed state: " + transformedState);
        
        // Demonstrate StateContainer
        System.out.println("\n=== State Container Demo ===");
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("creator", "Java Example");
        metadata.put("type", "demo");
        
        StateContainer<Map<String, Object>> stateContainer = new StateContainer<>(
            initialState, 
            metadata, 
            java.time.Instant.now().toString()
        );
        
        System.out.println("State container: " + stateContainer);
        
        // Update container data
        Map<String, Object> updatedData = new HashMap<>(initialState);
        updatedData.put("name", "Updated Java Demo");
        updatedData.put("updated", true);
        
        StateContainer<Map<String, Object>> updatedContainer = stateContainer.withData(updatedData);
        System.out.println("Updated container: " + updatedContainer);
        
        // Demonstrate multiple transformations
        System.out.println("\n=== Multiple Transformations Demo ===");
        
        Map<String, Object> currentState = new HashMap<>(initialState);
        
        // First transformation
        currentState = StopLibraryKt.transformState(currentState, (Function1<Map<String, Object>, Map<String, Object>>) state -> {
            Map<String, Object> newState = new HashMap<>(state);
            newState.put("step", 1);
            newState.put("transformation", "first");
            return newState;
        });
        
        System.out.println("After first transformation: " + currentState);
        
        // Second transformation
        currentState = StopLibraryKt.transformState(currentState, (Function1<Map<String, Object>, Map<String, Object>>) state -> {
            Map<String, Object> newState = new HashMap<>(state);
            newState.put("step", 2);
            newState.put("transformation", "second");
            return newState;
        });
        
        System.out.println("After second transformation: " + currentState);
        
        // Final processing with updated message
        stopInstance2.setMessage("Updated message from Java!");
        Map<String, Object> finalState = stopInstance2.processState(currentState);
        
        System.out.println("\n=== Final State ===");
        System.out.println("Final processed state: " + finalState);
        
        // Demonstrate creating multiple instances
        System.out.println("\n=== Multiple Instances Demo ===");
        StopLibrary[] instances = {
            StopLibraryKt.createStopInstance("Java Instance A"),
            StopLibraryKt.createStopInstance("Java Instance B"),
            StopLibraryKt.createStopInstance("Java Instance C")
        };
        
        for (int i = 0; i < instances.length; i++) {
            System.out.println("Instance " + (i + 1) + ": " + instances[i].getGreeting());
        }
        
        System.out.println("\nJava example completed successfully!");
    }
}
