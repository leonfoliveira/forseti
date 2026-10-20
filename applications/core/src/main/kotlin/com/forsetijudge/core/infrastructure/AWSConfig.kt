package com.forsetijudge.core.infrastructure

import com.forsetijudge.core.util.SafeLogger
import io.awspring.cloud.sqs.listener.errorhandler.ErrorHandler
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.Message
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.scheduler.SchedulerClient
import java.net.URI

@Configuration
class AWSConfig(
    @Value($$"${spring.cloud.aws.region.static}")
    private val region: String,
    @Value($$"${spring.cloud.aws.endpoint:}")
    private val endpoint: String,
    @Value($$"${spring.cloud.aws.credentials.access-key}")
    private val accessKey: String,
    @Value($$"${spring.cloud.aws.credentials.secret-key}")
    private val secretKey: String,
) {
    private val logger = SafeLogger(this::class)

    private val credentials = StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey))

    @Bean
    fun schedulerClient(): SchedulerClient {
        val builder =
            SchedulerClient
                .builder()
                .region(Region.of(region))
                .credentialsProvider(credentials)

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
