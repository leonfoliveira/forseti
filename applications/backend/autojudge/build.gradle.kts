kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":core"))
    implementation(project(":infrastructure"))
    implementation(libs.java.diff.utils)
    implementation(libs.opencsv)

    testImplementation(testFixtures(project(":core")))
}

tasks.bootJar {
    archiveFileName.set("autojudge.jar")
}

kover {
    reports {
        filters {
            excludes {
                classes.addAll(
                    "live.forseti.autojudge.Application",
                    "live.forseti.autojudge.ApplicationKt",
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
