package com.forsetijudge.core.infrastructure

import com.forsetijudge.core.util.SafeLogger
import io.awspring.cloud.sqs.listener.errorhandler.ErrorHandler
import java.net.URI
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.Message
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.scheduler.SchedulerClient
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.sqs.SqsClient

@Configuration
class AWSConfig(
    @Value($$"${spring.cloud.aws.region.static}")
    private val region: String,
    @Value($$"${spring.cloud.aws.endpoint:}")
    private val endpoint: String,
) {
    private val logger = SafeLogger(this::class)

    private val s3CServiceConfiguration = S3Configuration.builder().pathStyleAccessEnabled(true).build()

    @Bean
    fun s3Client(): S3Client {
        val builder =
            S3Client
                .builder()
                .region(Region.of(region))
                .serviceConfiguration(s3CServiceConfiguration)

        if (endpoint.isNotBlank()) {
            builder.endpointOverride(URI.create(endpoint))
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

        return builder.build()
    }

    @Bean
    fun globalSqsErrorHandler(): ErrorHandler<Any> =
        object : ErrorHandler<Any> {
            override fun handle(
                message: Message<Any>,
                t: Throwable,
            ) {
                logger.error("Error processing SQS message with payload: ${message.payload}", t)
                throw t
            }
        }
}
