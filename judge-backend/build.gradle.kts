kotlin {
    jvmToolchain(21)
}

plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.ktlint)
    alias(libs.plugins.kover)
    alias(libs.plugins.spring)
}

allprojects {
    group = "io.github.leonfoliveira"
    version = "1.0-SNAPSHOT"

    repositories {
        mavenCentral()
    }

    apply(plugin = rootProject.libs.plugins.kotlin.jvm.get().pluginId)
    apply(plugin = rootProject.libs.plugins.kotlin.spring.get().pluginId)
    apply(plugin = rootProject.libs.plugins.ktlint.get().pluginId)
    apply(plugin = rootProject.libs.plugins.kover.get().pluginId)
    apply(plugin = rootProject.libs.plugins.spring.get().pluginId)
}

subprojects {
    dependencies {
        implementation(rootProject.libs.bundles.spring.core)
        implementation(rootProject.libs.kotlin.reflect)
        implementation(rootProject.libs.jackson.module.kotlin)

        testImplementation(rootProject.libs.bundles.mockk)
        testImplementation(rootProject.libs.spring.boot.starter.test)
        testImplementation(rootProject.libs.bundles.kotest)
    }

    tasks.test {
        useJUnitPlatform()
        jvmArgs("--add-opens", "java.base/java.time=ALL-UNNAMED")
    }
}

kover {
    reports {
        filters {
            excludes {
                classes.addAll(
                    "io.github.leonfoliveira.judge.Application",
                    "io.github.leonfoliveira.judge.ApplicationKt",
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

tasks.test {
    dependsOn(subprojects.map { it.tasks.test })
}
