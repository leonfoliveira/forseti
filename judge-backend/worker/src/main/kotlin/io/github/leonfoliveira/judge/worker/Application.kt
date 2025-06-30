package io.github.leonfoliveira.judge.worker

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.context.annotation.PropertySource
import org.springframework.context.annotation.PropertySources
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import java.util.TimeZone

@SpringBootApplication(
    scanBasePackages = [
        "io.github.leonfoliveira.judge.common",
        "io.github.leonfoliveira.judge.worker",
    ],
)
@PropertySources(
    value = [
        PropertySource("classpath:application.yml"),
        PropertySource("classpath:application-\${spring.profiles.active}.yml"),
        PropertySource("classpath:common.yml"),
        PropertySource("classpath:common-\${spring.profiles.active}.yml"),
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
        "io.github.leonfoliveira.judge.worker.feign",
    ],
)
class Application

fun main(args: Array<String>) {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
    runApplication<Application>(*args)
}
