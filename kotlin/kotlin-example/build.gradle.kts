plugins {
    kotlin("jvm")
    application
}

dependencies {
    implementation(project(":kotlin-stop"))
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
}

application {
    mainClass.set("com.vsirotin.kotlinexample.MainKt")
}

tasks.run.configure {
    standardInput = System.`in`
}
