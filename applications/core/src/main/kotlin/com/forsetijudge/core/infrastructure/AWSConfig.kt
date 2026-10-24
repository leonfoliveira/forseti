package com.forsetijudge.core.infrastructure

import java.net.URI
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.scheduler.SchedulerClient
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.sqs.SqsClient

@Configuration
class AWSConfig(
    @Value($$"${aws.region}")
    private val region: String,
    @Value($$"${aws.endpoint:}")
    private val endpoint: String,
    @Value($$"${aws.access-key-id:}")
    private val accessKeyId: String,
    @Value($$"${aws.secret-access-key:}")
    private val secretAccessKey: String,
) {
    private val s3CServiceConfiguration = S3Configuration.builder().pathStyleAccessEnabled(true).build()

    @Bean
    fun s3Client(): S3Client {
        val builder =
            S3Client
                .builder()
                .region(Region.of(region))
                .serviceConfiguration(s3CServiceConfiguration)

        if (endpoint.isNotBlank()) {
            builder
                .endpointOverride(URI.create(endpoint))
                .serviceConfiguration(
                    S3Configuration
                        .builder()
                        .pathStyleAccessEnabled(true)
                        .build(),
                )
        }

        if (accessKeyId.isNotBlank() && secretAccessKey.isNotBlank()) {
            builder.credentialsProvider {
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
            }
        }

        return builder.build()
    }

    @Bean
    fun s3Presigner(): S3Presigner {
        val builder =
            S3Presigner
                .builder()
                .region(Region.of(region))
                .serviceConfiguration(s3CServiceConfiguration)

        if (endpoint.isNotBlank()) {
            builder.endpointOverride(URI.create(endpoint))
        }

        if (accessKeyId.isNotBlank() && secretAccessKey.isNotBlank()) {
            builder.credentialsProvider {
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
            }
        }

        return builder.build()
    }

    @Bean
    fun schedulerClient(): SchedulerClient {
        val builder =
            SchedulerClient
                .builder()
                .region(Region.of(region))

        if (endpoint.isNotBlank()) {
            builder.endpointOverride(URI.create(endpoint))
        }

        if (accessKeyId.isNotBlank() && secretAccessKey.isNotBlank()) {
            builder.credentialsProvider {
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
            }
        }

        return builder.build()
    }

    @Bean
    fun secretsManagerClient(): SecretsManagerClient {
        val builder =
            SecretsManagerClient
                .builder()
                .region(Region.of(region))

        if (endpoint.isNotBlank()) {
            builder.endpointOverride(URI.create(endpoint))
        }

        if (accessKeyId.isNotBlank() && secretAccessKey.isNotBlank()) {
            builder.credentialsProvider {
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
            }
        }

        return builder.build()
    }

    @Bean
    fun sqsClient(): SqsClient {
        val builder =
            SqsClient
                .builder()
                .region(Region.of(region))

        if (endpoint.isNotBlank()) {
            builder.endpointOverride(URI.create(endpoint))
        }

        if (accessKeyId.isNotBlank() && secretAccessKey.isNotBlank()) {
            builder.credentialsProvider {
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
            }
        }

        return builder.build()
    }
}
