kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":core"))
    implementation(project(":infrastructure"))

    implementation(libs.netty.socketio)

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
                    "com.forsetijudge.api.Application",
                    "com.forsetijudge.api.ApplicationKt",
                )
                annotatedBy(
                    "org.springframework.context.annotation.Configuration",
                    "com.forsetijudge.core.config.SkipCoverage",
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
