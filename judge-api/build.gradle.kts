import org.gradle.internal.classpath.Instrumented.systemProperty
import org.yaml.snakeyaml.Yaml

kotlin {
    jvmToolchain(21)
}

plugins {
    alias(libs.plugins.flyway)
    alias(libs.plugins.kotlin.jpa)
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.ktlint)
    alias(libs.plugins.kover)
    alias(libs.plugins.spring)
}

group = "io.github.leonfoliveira"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.bundles.spring)
    implementation(libs.kotlin.reflect)
    implementation(libs.jackson.module.kotlin)
    implementation(libs.java.diff.utils)
    implementation(libs.java.jwt)
    implementation(libs.hibernate.envers)
    implementation(libs.hibernate.types)
    implementation(libs.flyway)
    implementation(libs.postgresql)
    implementation(libs.micrometer.tracing.bridge.otel)
    implementation(libs.opencsv)

    testImplementation(libs.bundles.kotest)
    testImplementation(libs.bundles.mockk)
    testImplementation(libs.spring.boot.starter.test)
    testImplementation(libs.bundles.testcontainers)

    developmentOnly(libs.spring.boot.dev.tools)
}

buildscript {
    dependencies {
        classpath(libs.snakeyaml)
    }
}

val yaml = Yaml()
val activeProfile = System.getenv("SPRING_PROFILES_ACTIVE") ?: "development"
val configFile = File("$rootDir/src/main/resources/application-$activeProfile.yml")
val config: Map<String, Any> = yaml.load(configFile.inputStream())

@Suppress("UNCHECKED_CAST")
fun resolve(key: String): String {
    val path = key.split(".")
    var value: Any = config
    path.forEach { value = (value as Map<String, Any>)[it]!! }
    val regex = "\\$\\{([^:}]+):([^}]+)}".toRegex()
    return regex.replace(value as String) { match ->
        val envVar = match.groupValues[1]
        val default = match.groupValues[2]
        System.getenv(envVar) ?: default
    }
}

flyway {
    url = resolve("spring.datasource.url")
    user = resolve("spring.datasource.username")
    password = resolve("spring.datasource.password")
    locations = arrayOf("filesystem:./src/main/resources/db/migration")
    baselineOnMigrate = true
    validateMigrationNaming = true
    cleanDisabled = false
}

kover {
    reports {
        filters {
            excludes {
                classes.addAll(
                    "io.leonfoliveira.judge.Application",
                    "io.leonfoliveira.judge.ApplicationKt",
                )
                annotatedBy("org.springframework.context.annotation.Configuration")
            }
        }
        verify {
            rule("Minimum Line Coverage") {
                minBound(90)
            }
        }
    }
}

tasks.bootJar {
    archiveFileName.set("app.jar")
}

tasks.bootRun {
    dependsOn("flywayMigrate")
    systemProperty("spring.profiles.active", "development")
    jvmArgs("--add-opens", "java.base/java.time=ALL-UNNAMED")
}

tasks.test {
    useJUnitPlatform()
    jvmArgs("--add-opens", "java.base/java.time=ALL-UNNAMED")
}
