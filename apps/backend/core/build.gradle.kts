import org.yaml.snakeyaml.Yaml

group = "com.forsetijudge"
version = "unspecified"

repositories {
    mavenCentral()
}

plugins {
    id("buildsrc.convention.kotlin-jvm")
    alias(libs.plugins.flyway)
    alias(libs.plugins.ktlint)
    alias(libs.plugins.kotlinJpa)
    alias(libs.plugins.kotlinSpring)
    alias(libs.plugins.kover)
    alias(libs.plugins.spring)
    `java-test-fixtures`
}

dependencies {
    implementation(libs.bcrypt)
    implementation(libs.hibernateEnvers)
    implementation(libs.hibernateTypes)
    implementation(libs.jacksonDatatypeJsr310)
    implementation(libs.jacksonModuleKotlin)
    implementation(libs.kotlinReflect)
    implementation(libs.kotlinxDatetime)
    implementation(libs.kotlinxSerialization)
    implementation(libs.kotlinxCoroutines)
    implementation(libs.nettySocketio)
    implementation(libs.opencsv)
    implementation(libs.postgresql)
    implementation(libs.springBootStarter)
    implementation(libs.springBootStarterDataJpa)
    implementation(libs.springBootStarterValidation)
    implementation(libs.springBootStarterWeb)
    implementation(libs.springBootStarterWebsocket)
    implementation(libs.uuidCreator)

    testImplementation(libs.kotestAssertionsCore)
    testImplementation(libs.kotestRunnerJunit5)
    testImplementation(libs.kotestExtensionsSpring)
    testImplementation(libs.mockk)
    testImplementation(libs.springBootStarterTest)
    testImplementation(libs.springBootTestcontainers)
    testImplementation(libs.springmockk)
    testImplementation(libs.testcontainersJunitJupiter)
}

buildscript {
    dependencies {
        classpath(libs.snakeyaml)
    }
}

val yaml = Yaml()
val activeProfile = System.getenv("SPRING_PROFILES_ACTIVE") ?: "development"
val configFile = File("$rootDir/core/src/main/resources/core-$activeProfile.yml")
val config: Map<String, Any> = yaml.load(configFile.inputStream())

@Suppress("UNCHECKED_CAST")
fun resolve(key: String): String {
    val path = key.split(".")
    var value: Any = config
    path.forEach { value = (value as Map<String, Any>)[it]!! }
    val regex = "\\$\\{([^:}]+):([^}]+)}".toRegex()
    return regex.replace(value as String) { match ->
        val envVar = match.groupValues[1]
        val default = match.groupValues[2]
        System.getenv(envVar) ?: default
    }
}

flyway {
    url = resolve("spring.datasource.url")
    user = resolve("spring.datasource.username")
    password = resolve("spring.datasource.password")
    locations = arrayOf("filesystem:./src/main/resources/migration")
    baselineOnMigrate = true
    validateMigrationNaming = true
    cleanDisabled = false
}

kover {
    reports {
        filters {
            excludes {
                annotatedBy(
                    "org.springframework.context.annotation.Configuration",
                    "com.forsetijudge.core.config.SkipCoverage",
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

tasks.bootJar {
    archiveFileName.set("core.jar")
}

tasks.test {
    useJUnitPlatform()
}
