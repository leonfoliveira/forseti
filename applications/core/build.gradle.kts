import org.yaml.snakeyaml.Yaml

group = "com.forsetijudge"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

plugins {
    alias(libs.plugins.flyway)
    alias(libs.plugins.kotlinJpa)
    alias(libs.plugins.kotlinJvm)
    alias(libs.plugins.kotlinSerialization)
    alias(libs.plugins.kotlinSpring)
    alias(libs.plugins.ktlint)
    alias(libs.plugins.kover)
    alias(libs.plugins.spring)
    `java-test-fixtures`
}

dependencies {
    implementation(libs.bcrypt)
    implementation(libs.hibernateEnvers)
    implementation(libs.hypersistenceUtilsHibernate70)
    implementation(libs.jacksonModuleKotlin)
    implementation(libs.kotlinReflect)
    implementation(libs.kotlinxDatetime)
    implementation(libs.kotlinxSerializationJson)
    implementation(libs.kotlinxCoroutines)
    implementation(libs.nettySocketio)
    implementation(libs.opencsv)
    implementation(libs.opentelemetryApi)
    implementation(libs.opentelemetryInstrumentationLogbackMdc)
    implementation(libs.postgresql)
    implementation(libs.prometheusMetricsCore)
    implementation(libs.prometheusMetricsExporterServletJakarta)
    implementation(libs.prometheusMetricsInstrumentationJvm)
    implementation(libs.springBootStarter)
    implementation(libs.springBootStarterActuator)
    implementation(libs.springBootStarterDataJpa)
    implementation(libs.springBootStarterDataRedis)
    implementation(libs.springBootStarterSecurity)
    implementation(libs.springBootStarterValidation)
    implementation(libs.springBootStarterWeb)
    implementation(libs.springBootStarterWebsocket)
    implementation(libs.springCloudAwsStarterS3)
    implementation(libs.springCloudAwsStarterSecretsManager)
    implementation(libs.springCloudAwsStarterSQS)
    implementation(libs.uuidCreator)

    testFixturesApi(libs.junitJupiterApi)
    testFixturesApi(libs.testcontainersLocalstack)
    testFixturesApi(libs.testcontainersRedis)
    testFixturesImplementation(libs.jacksonModuleKotlin)
    testFixturesImplementation(libs.springBootStarterDataRedis)
    testFixturesImplementation(libs.springCloudAwsStarterS3)
    testFixturesImplementation(libs.springCloudAwsStarterSecretsManager)
    testFixturesImplementation(libs.springCloudAwsStarterSQS)

    testImplementation(libs.mockitoKotlin)
    testImplementation(libs.springBootStarterTest)
    testImplementation(libs.springBootTestcontainers)
    testImplementation(libs.testcontainersJunitJupiter)
    testImplementation(libs.testcontainersPostgresql)

    developmentOnly(libs.springBootDevTools)
}

buildscript {
    dependencies {
        classpath(libs.snakeyaml)
        classpath(libs.flywayDatabasePostgresql)
    }
}

val yaml = Yaml()
val activeProfile = System.getenv("SPRING_PROFILES_ACTIVE") ?: "development"
val configFile = File("$rootDir/src/main/resources/application-$activeProfile.yaml")
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
                    "com.forsetijudge.core.util.SkipCoverage",
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
