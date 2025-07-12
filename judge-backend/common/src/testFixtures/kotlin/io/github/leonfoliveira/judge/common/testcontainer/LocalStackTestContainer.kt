package io.github.leonfoliveira.judge.common.testcontainer

import org.testcontainers.containers.localstack.LocalStackContainer
import org.testcontainers.utility.DockerImageName

class LocalStackTestContainer {
    val bucketName = "judge-name"
    val submissionQueue = "submission-queue"
    val submissionFailedQueue = "submission-failed-queue"

    val container: LocalStackContainer = LocalStackContainer(
        DockerImageName.parse("gresau/localstack-persist:4.4.0").asCompatibleSubstituteFor("localstack/localstack")
    ).withServices(LocalStackContainer.Service.S3, LocalStackContainer.Service.SQS)

    fun start(): LocalStackTestContainer {
        container.start()

        container.execInContainer("awslocal", "s3", "mb", "s3://$bucketName")
        container.execInContainer("awslocal", "sqs", "create-queue", "--queue-name", submissionQueue)
        container.execInContainer("awslocal", "sqs", "create-queue", "--queue-name", submissionFailedQueue)

        System.setProperty("spring.cloud.aws.endpoint", container.getEndpointOverride(LocalStackContainer.Service.S3).toString())
        System.setProperty("spring.cloud.aws.region.static", container.region)
        System.setProperty("spring.cloud.aws.credentials.access-key", container.accessKey)
        System.setProperty("spring.cloud.aws.credentials.secret-key", container.secretKey)
        System.setProperty("spring.cloud.aws.s3.bucket", bucketName)
        System.setProperty("spring.cloud.aws.sqs.submission-queue", submissionQueue)
        System.setProperty("spring.cloud.aws.sqs.submission-failed-queue", submissionFailedQueue)

        return this
    }
}