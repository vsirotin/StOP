plugins {
    java
    application
}

dependencies {
    implementation(project(":kotlin-stop"))
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
}

application {
    mainClass.set("com.vsirotin.javaexample.Main")
}

java {
    sourceCompatibility = JavaVersion.VERSION_22
    targetCompatibility = JavaVersion.VERSION_22
}

tasks.run.configure {
    standardInput = System.`in`
}
