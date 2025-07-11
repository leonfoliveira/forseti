kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":common"))
    implementation(libs.java.diff.utils)
    implementation(libs.opencsv)

    testImplementation(testFixtures(project(":common")))
}

tasks.bootJar {
    archiveFileName.set("judge-worker.jar")
}

kover {
    reports {
        filters {
            excludes {
                classes.addAll(
                    "io.github.leonfoliveira.judge.worker.Application",
                    "io.github.leonfoliveira.judge.worker.ApplicationKt",
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
