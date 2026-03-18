kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":core"))

    implementation(libs.bcrypt)
    implementation(libs.minio)
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
