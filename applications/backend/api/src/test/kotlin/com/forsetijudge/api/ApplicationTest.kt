package com.forsetijudge.api

import org.springframework.amqp.rabbit.annotation.EnableRabbit
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.test.context.ActiveProfiles
import java.util.TimeZone

@SpringBootApplication(
    scanBasePackages = [
        "com.forsetijudge.core",
        "com.forsetijudge.infrastructure",
        "com.forsetijudge.api",
    ],
)
@EntityScan(
    basePackages = [
        "com.forsetijudge.core.domain.entity",
    ],
)
@EnableJpaRepositories(
    basePackages = [
        "com.forsetijudge.core.port.driven.repository",
    ],
)
@EnableRabbit
@EnableScheduling
@ActiveProfiles("test")
class ApplicationTest

fun main(args: Array<String>) {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
    runApplication<ApplicationTest>(*args)
}
