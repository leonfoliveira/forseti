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
    archiveFileName.set("judge-autojudge.jar")
}

kover {
    reports {
        filters {
            excludes {
                classes.addAll(
                    "io.github.leonfoliveira.judge.autojudge.Application",
                    "io.github.leonfoliveira.judge.autojudge.ApplicationKt",
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
