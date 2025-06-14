package io.github.leonfoliveira.judge.worker

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import java.util.TimeZone

@SpringBootApplication(
    scanBasePackages = [
        "io.github.leonfoliveira.judge.core",
        "io.github.leonfoliveira.judge.adapter",
        "io.github.leonfoliveira.judge.worker",
    ],
)
@EntityScan(
    basePackages = [
        "io.github.leonfoliveira.judge.core.domain.entity",
    ],
)
@EnableJpaRepositories(
    basePackages = [
        "io.github.leonfoliveira.judge.core.repository",
    ],
)
@EnableFeignClients(
    basePackages = [
        "io.github.leonfoliveira.judge.worker.feign",
    ],
)
class Application

fun main(args: Array<String>) {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
    runApplication<Application>(*args)
}
