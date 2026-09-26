package com.forsetijudge.core

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.persistence.autoconfigure.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@SpringBootApplication(
    scanBasePackages = [
        "com.forsetijudge.core",
    ],
)
@EntityScan(
    basePackages = [
        "com.forsetijudge.core.domain.entity",
    ],
)
@EnableJpaRepositories(
    basePackages = [
        "com.forsetijudge.core.port.out.repository",
    ],
)
class AppKt

fun main(args: Array<String>) {
    runApplication<AppKt>(*args)
}
