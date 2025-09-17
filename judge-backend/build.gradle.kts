kotlin {
    jvmToolchain(21)
}

plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.ktlint)
    alias(libs.plugins.kover)
    alias(libs.plugins.spring)
    `java-test-fixtures`
}

allprojects {
    group = "io.github.leonfoliveira"
    version = "1.0-SNAPSHOT"

    repositories {
        mavenCentral()
    }

    apply(
        plugin =
            rootProject.libs.plugins.kotlin.jvm
                .get()
                .pluginId,
    )
    apply(
        plugin =
            rootProject.libs.plugins.kotlin.spring
                .get()
                .pluginId,
    )
    apply(
        plugin =
            rootProject.libs.plugins.ktlint
                .get()
                .pluginId,
    )
    apply(
        plugin =
            rootProject.libs.plugins.kover
                .get()
                .pluginId,
    )
    apply(
        plugin =
            rootProject.libs.plugins.spring
                .get()
                .pluginId,
    )
    apply(plugin = "java-test-fixtures")
}

subprojects {
    dependencies {
        implementation(rootProject.libs.bundles.jackson)
        implementation(rootProject.libs.bundles.micrometer)
        implementation(rootProject.libs.bundles.spring)
        implementation(rootProject.libs.kotlin.reflect)
        implementation(rootProject.libs.minio)

        testImplementation(rootProject.libs.bundles.kotest)
        testImplementation(rootProject.libs.bundles.mockk)
        testImplementation(rootProject.libs.bundles.testcontainers)
        testImplementation(rootProject.libs.spring.boot.starter.test)

        testFixturesImplementation(rootProject.libs.bundles.kotest)
        testFixturesImplementation(rootProject.libs.bundles.mockk)
        testFixturesImplementation(rootProject.libs.bundles.testcontainers)
        testFixturesImplementation(rootProject.libs.spring.boot.starter.test)

        developmentOnly(rootProject.libs.spring.boot.dev.tools)
    }

    tasks.test {
        useJUnitPlatform()
        jvmArgs("--add-opens", "java.base/java.time=ALL-UNNAMED")
    }
}

tasks.test {
    dependsOn(subprojects.map { it.tasks.test })
}
