package live.forseti.infrastructure

import org.springframework.amqp.rabbit.annotation.EnableRabbit
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.test.context.ActiveProfiles

@SpringBootApplication(
    scanBasePackages = [
        "live.forseti.core",
        "live.forseti.infrastructure",
    ],
)
@EntityScan(
    basePackages = [
        "live.forseti.core.domain.entity",
    ],
)
@EnableJpaRepositories(
    basePackages = [
        "live.forseti.core.port.driven.repository",
    ],
)
@EnableFeignClients(
    basePackages = [
        "live.forseti.infrastructure.adapter.driven.feign",
    ],
)
@EnableRabbit
@EnableScheduling
@ActiveProfiles("test")
class ApplicationTest

fun main(args: Array<String>) {
    runApplication<ApplicationTest>(*args)
}
