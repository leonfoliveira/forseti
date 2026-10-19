package com.forsetijudge.core.infrastructure

import com.forsetijudge.core.util.SafeLogger
import io.awspring.cloud.sqs.listener.errorhandler.ErrorHandler
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.Message
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.scheduler.SchedulerClient

@Configuration
class AWSConfig(
    @Value($$"${spring.cloud.aws.region.static}")
    private val region: String,
) {
    private val logger = SafeLogger(this::class)

    @Bean
    fun schedulerClient(): SchedulerClient =
        SchedulerClient
            .builder()
            .region(Region.of(region))
            .credentialsProvider(DefaultCredentialsProvider.builder().build())
            .build()

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
