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
    implementation(libs.bundles.spring)
    implementation(libs.kotlin.reflect)
    implementation(libs.jackson.module.kotlin)
    implementation(libs.java.diff.utils)
    implementation(libs.java.jwt)
    implementation(libs.hibernate.envers)
    implementation(libs.hibernate.types)
    implementation(libs.flyway)
    implementation(libs.postgresql)
    implementation(libs.opencsv)

    testImplementation(libs.bundles.kotest)
    testImplementation(libs.bundles.mockk)
    testImplementation(libs.spring.boot.starter.test)

    developmentOnly(libs.spring.boot.dev.tools)
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

fun runCommand(command: String) {
    val output =
        ProcessBuilder(*command.split(" ").toTypedArray())
            .redirectErrorStream(true)
            .start()
            .also { it.waitFor() }
    print(output.inputStream.bufferedReader().readText())
}

tasks.register("initLocalStack") {
    group = "localstack"
    doLast {
        val bucket = "judge"
        print("Creating bucket...")
        runCommand("aws --endpoint-url=http://localhost:4566 s3 mb s3://$bucket")

        val queues = listOf("submission-queue")
        print("Creating queues...")
        for (queue in queues) {
            runCommand("aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name $queue")
        }
    }
}

tasks.named("bootRun") {
    dependsOn("initLocalStack")
}
