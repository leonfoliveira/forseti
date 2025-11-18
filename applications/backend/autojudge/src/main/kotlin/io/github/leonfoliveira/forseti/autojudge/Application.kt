package io.github.leonfoliveira.forseti.autojudge

import io.prometheus.metrics.instrumentation.jvm.JvmMetrics
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
        "io.github.leonfoliveira.forseti.common.application.domain.entity",
    ],
)
@EnableJpaRepositories(
    basePackages = [
        "io.github.leonfoliveira.forseti.common.application.port.driven.repository",
    ],
)
@EnableFeignClients(
    basePackages = [
        "io.github.leonfoliveira.forseti.autojudge.adapter.driven.feign",
    ],
)
@EnableRabbit
@EnableScheduling
class Application

fun main(args: Array<String>) {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
    runApplication<Application>(*args)
    JvmMetrics.builder().register()
}
