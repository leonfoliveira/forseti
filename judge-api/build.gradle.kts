plugins {
    alias(libs.plugins.flyway)
    alias(libs.plugins.kotlin.jpa)
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.ktlint)
    alias(libs.plugins.spring)
}

group = "io.github.leonfoliveira"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.bcrypt)
    implementation(libs.hibernate.envers)
    implementation(libs.hibernate.types)
    implementation(libs.flyway)
    implementation(libs.jackson.module.kotlin)
    implementation(libs.kotlin.reflect)
    implementation(libs.bundles.spring)
    implementation(libs.postgresql)

    testImplementation(libs.bundles.kotest)
    testImplementation(libs.mockk)
    testImplementation(libs.spring.boot.dev.tools)
}

kotlin {
    jvmToolchain(21)
}

val dbUrl = System.getenv("DB_URL") ?: "jdbc:postgresql://localhost:5432/judge"
val dbUser = System.getenv("DB_USER") ?: "judge"
val dbPassword = System.getenv("DB_PASSWORD") ?: "judge"

flyway {
    url = dbUrl
    user = dbUser
    password = dbPassword
    locations = arrayOf("filesystem:./src/main/resources/db/migration")
    baselineOnMigrate = true
    validateMigrationNaming = true
    cleanDisabled = false
}

tasks.test {
    useJUnitPlatform()
}

tasks.bootJar {
    archiveFileName.set("app.jar")
}
