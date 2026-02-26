package com.forsetijudge.core.testcontainer

import com.redis.testcontainers.RedisContainer
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName

@TestConfiguration(proxyBeanMethods = false)
class RedisTestContainer {
    @Bean
    @ServiceConnection
    fun redisTestContainer(): RedisContainer {
        val container = RedisContainer(DockerImageName.parse("redis:8.6.1-alpine"))
        container.start()

        System.setProperty("spring.redis.host", container.host)
        System.setProperty("spring.redis.port", container.firstMappedPort.toString())

        return container
    }

    @Bean
    fun redisConnectionFactory(container: RedisContainer): RedisConnectionFactory =
        LettuceConnectionFactory(container.host, container.firstMappedPort)
}
