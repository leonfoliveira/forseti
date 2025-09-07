kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":common"))
    implementation(rootProject.libs.springdoc.openapi.ui)
    implementation(rootProject.libs.caffeine)

    testImplementation(testFixtures(project(":common")))
}

tasks.bootJar {
    archiveFileName.set("judge-api.jar")
}

tasks.bootRun {
    dependsOn(":common:flywayMigrate")
}

kover {
    reports {
        filters {
            excludes {
                classes.addAll(
                    "io.github.leonfoliveira.judge.api.Application",
                    "io.github.leonfoliveira.judge.api.ApplicationKt",
                )
                annotatedBy(
                    "org.springframework.context.annotation.Configuration",
                    "io.github.leonfoliveira.judge.common.util.SkipCoverage",
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
