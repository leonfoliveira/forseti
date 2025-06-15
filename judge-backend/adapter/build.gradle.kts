kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":core"))
    implementation(libs.java.diff.utils)
    implementation(libs.java.jwt)
    implementation(libs.opencsv)
}

kover {
    reports {
        filters {
            excludes {
                annotatedBy("org.springframework.context.annotation.Configuration")
            }
        }
        verify {
            rule("Minimum Line Coverage") {
                minBound(80)
            }
        }
    }
}
