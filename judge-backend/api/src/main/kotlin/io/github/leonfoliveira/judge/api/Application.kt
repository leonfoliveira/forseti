package io.github.leonfoliveira.judge.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import java.util.TimeZone

@SpringBootApplication(
    scanBasePackages = [
        "io.github.leonfoliveira.judge.common",
        "io.github.leonfoliveira.judge.api",
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
class Application

fun main(args: Array<String>) {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
    runApplication<Application>(*args)
}
