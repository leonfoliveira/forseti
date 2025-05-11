package io.leonfoliveira.judge.adapter.aws

import java.net.URI
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client

@Configuration
class AwsConfig {
    @Value("\${cloud.aws.endpoint}")
    private lateinit var endpoint: URI

    @Value("\${cloud.aws.region.static}")
    private lateinit var region: Region

    @Bean
    fun s3Client(): S3Client {
        return S3Client.builder()
            .region(region)
            .endpointOverride(endpoint)
            .forcePathStyle(true)
            .build()
    }
}