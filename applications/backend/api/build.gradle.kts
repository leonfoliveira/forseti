kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":common"))
    implementation(rootProject.libs.springdoc.openapi.ui)

    testImplementation(testFixtures(project(":common")))
}

tasks.bootJar {
    archiveFileName.set("api.jar")
}

tasks.bootRun {
    dependsOn(":common:flywayMigrate")
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
