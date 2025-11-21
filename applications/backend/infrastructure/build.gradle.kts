kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":core"))

    testImplementation(testFixtures(project(":core")))
}

tasks.bootJar {
    archiveFileName.set("api.jar")
}

tasks.bootRun {
    dependsOn(":core:flywayMigrate")
}

kover {
    reports {
        filters {
            excludes {
                classes.addAll(
                    "io.github.leonfoliveira.forseti.api.Application",
                    "io.github.leonfoliveira.forseti.api.ApplicationKt",
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
