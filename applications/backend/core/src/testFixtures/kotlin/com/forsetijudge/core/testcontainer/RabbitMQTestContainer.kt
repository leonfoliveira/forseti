package com.forsetijudge.core.testcontainer

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.testcontainers.containers.RabbitMQContainer
import org.testcontainers.utility.DockerImageName

@TestConfiguration(proxyBeanMethods = false)
class RabbitMQTestContainer {
    @Bean
    fun rabbitMQTestContainer(): RabbitMQContainer {
        val container =
            RabbitMQContainer(
                DockerImageName.parse("rabbitmq:4.1.4-management-alpine"),
            )
        container.start()

        System.setProperty("spring.rabbitmq.host", container.host)
        System.setProperty("spring.rabbitmq.port", container.amqpPort.toString())
        System.setProperty("spring.rabbitmq.username", container.adminUsername)
        System.setProperty("spring.rabbitmq.password", container.adminPassword)

        return container
    }
}
