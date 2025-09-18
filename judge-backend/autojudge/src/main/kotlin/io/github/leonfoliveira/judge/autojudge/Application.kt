package io.github.leonfoliveira.judge.autojudge

import org.springframework.amqp.rabbit.annotation.EnableRabbit
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import java.util.TimeZone

@SpringBootApplication(
    scanBasePackages = [
        "io.github.leonfoliveira.judge.common",
        "io.github.leonfoliveira.judge.autojudge",
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
@EnableFeignClients(
    basePackages = [
        "io.github.leonfoliveira.judge.autojudge.feign",
    ],
)
@EnableRabbit
class Application

fun main(args: Array<String>) {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
    runApplication<Application>(*args)
}
