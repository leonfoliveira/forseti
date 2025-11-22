plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}
rootProject.name = "backend"

include("api")
include("autojudge")
include("core")

include("infrastructure")
