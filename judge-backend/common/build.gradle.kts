import org.yaml.snakeyaml.Yaml

kotlin {
    jvmToolchain(21)
}

plugins {
    alias(libs.plugins.flyway)
    alias(libs.plugins.kotlin.jpa)
}

dependencies {
    implementation(libs.hibernate.envers)
    implementation(libs.hibernate.types)
    implementation(libs.flyway)
    implementation(libs.opencsv)
    implementation(libs.postgresql)
}

tasks.bootJar {
    archiveFileName.set("judge-common.jar")
}

buildscript {
    dependencies {
        classpath(libs.snakeyaml)
    }
}

val yaml = Yaml()
val activeProfile = System.getenv("SPRING_PROFILES_ACTIVE") ?: "development"
val configFile = File("$rootDir/common/src/main/resources/common-$activeProfile.yml")
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
                packages("io.github.leonfoliveira.judge.common.mock")
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
