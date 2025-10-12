package io.github.leonfoliveira.forseti.common.testcontainer

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName

@TestConfiguration(proxyBeanMethods = false)
class PostgresTestContainer {
    @Bean
    @ServiceConnection
    fun container(): PostgreSQLContainer<*> =
        PostgreSQLContainer(DockerImageName.parse("postgres:17.5-alpine"))
            .withDatabaseName("forseti")
            .withUsername("forseti")
            .withPassword("forseti")
}
