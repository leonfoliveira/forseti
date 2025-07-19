package io.github.leonfoliveira.judge.common

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.test.context.ActiveProfiles

@SpringBootApplication(
    scanBasePackages = [
        "io.github.leonfoliveira.judge.common",
    ],
)
@EntityScan(
    basePackages = [
        "io.github.leonfoliveira.judge.common.domain.entity",
    ],
)
@EnableJpaRepositories(
    basePackages = [
        "io.github.leonfoliveira.judge.common.repository",
    ],
)
@ActiveProfiles("test")
class ApplicationTest

fun main(args: Array<String>) {
    runApplication<ApplicationTest>(*args)
}
