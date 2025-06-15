kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":core"))
    implementation(project(":adapter"))
    implementation(libs.bundles.spring.api)
    implementation(libs.micrometer.tracing.bridge.otel)

    developmentOnly(libs.spring.boot.dev.tools)
}

tasks.bootJar {
    archiveFileName.set("judge-api.jar")
}

tasks.bootRun {
    dependsOn(":core:flywayMigrate")
}

kover {
    reports {
        filters {
            excludes {
                classes.addAll(
                    "io.github.leonfoliveira.judge.api.Application",
                    "io.github.leonfoliveira.judge.api.ApplicationKt",
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
