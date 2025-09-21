package io.github.leonfoliveira.judge.common.testcontainer

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.testcontainers.containers.MinIOContainer
import org.testcontainers.utility.DockerImageName

@TestConfiguration(proxyBeanMethods = false)
class MinioTestContainer {
    @Bean
    fun minioTestContainer(): MinIOContainer {
        val container =
            MinIOContainer(
                DockerImageName.parse("minio/minio:RELEASE.2025-09-07T16-13-09Z"),
            )
        container.start()

        System.setProperty("minio.endpoint", "http://${container.host}:${container.firstMappedPort}")
        System.setProperty("minio.accessKey", container.userName)
        System.setProperty("minio.secretKey", container.password)
        System.setProperty("minio.bucket", "judge")

        return container
    }
}
