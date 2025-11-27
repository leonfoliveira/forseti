kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":core"))
    implementation(project(":infrastructure"))

    implementation(rootProject.libs.springdoc.openapi.ui)

    testImplementation(testFixtures(project(":core")))
}

tasks.bootJar {
    archiveFileName.set("api.jar")
}

tasks.bootRun {
    dependsOn(":core:flywayMigrate")
    val agentPath = rootProject.file("opentelemetry-javaagent.jar")
    if (agentPath.exists()) {
        jvmArgs(
            "-javaagent:${agentPath.absolutePath}",
            "-Dotel.logs.exporter=none",
            "-Dotel.traces.exporter=none",
            "-Dotel.metrics.exporter=none",
        )
        println("OpenTelemetry Java agent enabled: ${agentPath.absolutePath}")
    } else {
        println("WARNING: OpenTelemetry Java agent not found at ${agentPath.absolutePath}")
    }
}

kover {
    reports {
        filters {
            excludes {
                classes.addAll(
                    "live.forseti.api.Application",
                    "live.forseti.api.ApplicationKt",
                )
                annotatedBy(
                    "org.springframework.context.annotation.Configuration",
                )
            }
        }
        verify {
            rule("Minimum Line Coverage") {
                minBound(90)
            }
        }
    }
}
