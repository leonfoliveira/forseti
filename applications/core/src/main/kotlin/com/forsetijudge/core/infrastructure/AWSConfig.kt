package com.forsetijudge.core.infrastructure

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.scheduler.SchedulerClient

@Configuration
class AWSConfig(
    @Value($$"${spring.cloud.aws.region.static}")
    private val region: String,
) {
    @Bean
    fun schedulerClient(): SchedulerClient =
        SchedulerClient
            .builder()
            .region(Region.of(region))
            .credentialsProvider(DefaultCredentialsProvider.builder().build())
            .build()
}
