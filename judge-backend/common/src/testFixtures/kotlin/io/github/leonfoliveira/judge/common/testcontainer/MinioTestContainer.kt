package io.github.leonfoliveira.judge.common.testcontainer

import org.springframework.boot.test.context.TestConfiguration
import org.testcontainers.containers.MinIOContainer
import org.testcontainers.utility.DockerImageName

@TestConfiguration(proxyBeanMethods = false)
class MinioTestContainer {
    fun minioTestContainer(): MinIOContainer {
        val container =
            MinIOContainer(
                DockerImageName.parse("minio/minio:RELEASE.2025-09-07T16-13-09Z"),
            )
        container.start()
        return container
    }
}
