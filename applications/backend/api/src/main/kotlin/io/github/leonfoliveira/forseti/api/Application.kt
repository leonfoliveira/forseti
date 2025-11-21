package io.github.leonfoliveira.forseti.api

import org.springframework.amqp.rabbit.annotation.EnableRabbit
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableScheduling
import java.util.TimeZone

@SpringBootApplication(
    scanBasePackages = [
        "io.github.leonfoliveira.forseti.core",
        "io.github.leonfoliveira.forseti.api",
    ],
)
@EntityScan(
    basePackages = [
        "io.github.leonfoliveira.forseti.core.domain.entity",
    ],
)
@EnableJpaRepositories(
    basePackages = [
        "io.github.leonfoliveira.forseti.core.port.driven.repository",
    ],
)
@EnableScheduling
@EnableRabbit
class Application

fun main(args: Array<String>) {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
    runApplication<Application>(*args)
}
