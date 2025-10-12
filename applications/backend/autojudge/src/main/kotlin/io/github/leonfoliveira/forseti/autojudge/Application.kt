package io.github.leonfoliveira.forseti.autojudge

import org.springframework.amqp.rabbit.annotation.EnableRabbit
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableScheduling
import java.util.TimeZone

@SpringBootApplication(
    scanBasePackages = [
        "io.github.leonfoliveira.forseti.common",
        "io.github.leonfoliveira.forseti.autojudge",
    ],
)
@EntityScan(
    basePackages = [
        "io.github.leonfoliveira.forseti.common.domain.entity",
    ],
)
@EnableJpaRepositories(
    basePackages = [
        "io.github.leonfoliveira.forseti.common.repository",
    ],
)
@EnableFeignClients(
    basePackages = [
        "io.github.leonfoliveira.forseti.autojudge.adapter.feign",
    ],
)
@EnableRabbit
@EnableScheduling
class Application

fun main(args: Array<String>) {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
    runApplication<Application>(*args)
}
