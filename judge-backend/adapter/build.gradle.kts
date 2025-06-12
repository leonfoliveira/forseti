kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":core"))
    implementation(libs.java.diff.utils)
    implementation(libs.java.jwt)
    implementation(libs.opencsv)
}
