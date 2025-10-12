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
    archiveFileName.set("autojudge.jar")
}

kover {
    reports {
        filters {
            excludes {
                classes.addAll(
                    "io.github.leonfoliveira.forseti.autojudge.Application",
                    "io.github.leonfoliveira.forseti.autojudge.ApplicationKt",
                )
                annotatedBy(
                    "org.springframework.context.annotation.Configuration",
                    "io.github.leonfoliveira.forseti.common.util.SkipCoverage",
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
