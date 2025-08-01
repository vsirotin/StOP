plugins {
    kotlin("jvm") version "2.0.20" apply false
}

allprojects {
    group = "com.vsirotin"
    version = "1.0.0"
    
    repositories {
        mavenCentral()
    }
}

subprojects {
    apply(plugin = "org.jetbrains.kotlin.jvm")
    
    tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_22)
        }
    }
}

// Task to build all projects
tasks.register("buildAll") {
    group = "build"
    description = "Build all Kotlin projects"
    dependsOn(subprojects.map { "${it.path}:build" })
}

// Task to clean all projects
tasks.register("cleanAll") {
    group = "build"
    description = "Clean all Kotlin projects"
    dependsOn(subprojects.map { "${it.path}:clean" })
}

// Task to run all examples
tasks.register("runExamples") {
    group = "application"
    description = "Run all example applications"
    dependsOn(
        ":kotlin-example:run",
        ":java-example:run"
    )
}
