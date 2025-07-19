package io.github.leonfoliveira.judge.common.testcontainer

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.testcontainers.containers.localstack.LocalStackContainer
import org.testcontainers.utility.DockerImageName

@TestConfiguration(proxyBeanMethods = false)
class LocalStackTestContainer {
    companion object {
        const val BUCKET_NAME = "judge"
        const val SUBMISSION_QUEUE = "submission-queue"
        const val SUBMISSION_FAILED_QUEUE = "submission-failed-queue"
    }

    @Bean
    fun localStackContainer(): LocalStackContainer {
        val container =
            LocalStackContainer(
                DockerImageName.parse("gresau/localstack-persist:4.4.0").asCompatibleSubstituteFor("localstack/localstack"),
            ).withServices(LocalStackContainer.Service.S3, LocalStackContainer.Service.SQS)
        container.start()

        container.execInContainer("awslocal", "s3", "mb", "s3://${BUCKET_NAME}")
        container.execInContainer("awslocal", "sqs", "create-queue", "--queue-name", SUBMISSION_QUEUE)
        container.execInContainer("awslocal", "sqs", "create-queue", "--queue-name", SUBMISSION_FAILED_QUEUE)

        System.setProperty(
            "spring.cloud.aws.endpoint",
            container.getEndpointOverride(LocalStackContainer.Service.S3).toString(),
        )
        System.setProperty("spring.cloud.aws.region.static", container.region)
        System.setProperty("spring.cloud.aws.credentials.access-key", container.accessKey)
        System.setProperty("spring.cloud.aws.credentials.secret-key", container.secretKey)

        return container
    }
}
