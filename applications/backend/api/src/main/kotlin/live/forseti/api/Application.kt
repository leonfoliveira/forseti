package live.forseti.api

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
        "live.forseti.core",
        "live.forseti.infrastructure",
        "live.forseti.api",
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
class Application

fun main(args: Array<String>) {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
    runApplication<Application>(*args)
}
