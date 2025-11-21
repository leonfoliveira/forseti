kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":core"))
    implementation(libs.opencsv)

    testImplementation(testFixtures(project(":core")))
}

tasks.bootJar {
    archiveFileName.set("infrastructure.jar")
}

tasks.bootRun {
    dependsOn(":core:flywayMigrate")
}

kover {
    reports {
        filters {
            excludes {
                classes.addAll(
                    "live.forseti.infrastructure.Application",
                    "live.forseti.infrastructure.ApplicationKt",
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
