package com.forsetijudge.core.testcontainer

import org.testcontainers.containers.localstack.LocalStackContainer
import org.testcontainers.utility.DockerImageName
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.sqs.SqsAsyncClient

/**
 * Base class for tests that run against a real LocalStack (S3, Secrets Manager and SQS) started by Testcontainers.
 * The container is shared by all subclasses and started once per JVM.
 */
abstract class TestContainerLocalStack {
    companion object {
        private val localStack: LocalStackContainer =
            LocalStackContainer(DockerImageName.parse("localstack/localstack:3.8"))
                .withServices(
                    LocalStackContainer.Service.S3,
                    LocalStackContainer.Service.SECRETSMANAGER,
                    LocalStackContainer.Service.SQS,
                ).also { it.start() }

        private val credentials =
            StaticCredentialsProvider.create(AwsBasicCredentials.create(localStack.accessKey, localStack.secretKey))

        val s3Client: S3Client =
            S3Client
                .builder()
                .endpointOverride(localStack.endpoint)
                .credentialsProvider(credentials)
                .region(Region.of(localStack.region))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .build()

        val s3Presigner: S3Presigner =
            S3Presigner
                .builder()
                .endpointOverride(localStack.endpoint)
                .credentialsProvider(credentials)
                .region(Region.of(localStack.region))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .build()

        val secretsManagerClient: SecretsManagerClient =
            SecretsManagerClient
                .builder()
                .endpointOverride(localStack.endpoint)
                .credentialsProvider(credentials)
                .region(Region.of(localStack.region))
                .build()

        val sqsAsyncClient: SqsAsyncClient =
            SqsAsyncClient
                .builder()
                .endpointOverride(localStack.endpoint)
                .credentialsProvider(credentials)
                .region(Region.of(localStack.region))
                .build()
    }
}
