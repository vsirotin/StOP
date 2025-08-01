plugins {
    kotlin("jvm")
    `java-library`
    `maven-publish`
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testImplementation("org.junit.jupiter:junit-jupiter:5.9.2")
}

tasks.test {
    useJUnitPlatform()
}

publishing {
    publications {
        create<MavenPublication>("maven") {
            groupId = "com.vsirotin"
            artifactId = "kotlin-stop"
            version = "1.0.0"
            
            from(components["java"])
            
            pom {
                name.set("Kotlin StOP Library")
                description.set("Kotlin State Oriented Programming library")
                url.set("https://github.com/vsirotin/StOP")
                
                licenses {
                    license {
                        name.set("MIT License")
                        url.set("https://opensource.org/licenses/MIT")
                    }
                }
                
                developers {
                    developer {
                        id.set("vsirotin")
                        name.set("Viktor Sirotin")
                    }
                }
            }
        }
    }
}
