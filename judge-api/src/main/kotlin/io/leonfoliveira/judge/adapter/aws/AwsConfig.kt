package io.leonfoliveira.judge.adapter.aws

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.sqs.SqsClient
import java.net.URI
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider

@Configuration
class AwsConfig {
    @Value("\${spring.cloud.aws.endpoint}")
    private lateinit var endpoint: URI

    @Value("\${spring.cloud.aws.region.static}")
    private lateinit var region: Region

    @Value("\${spring.cloud.aws.credentials.access-key}")
    private lateinit var accessKey: String

    @Value("\${spring.cloud.aws.credentials.secret-key}")
    private lateinit var secretKey: String

    private val credentialsProvider by lazy {
        StaticCredentialsProvider.create(
            AwsBasicCredentials.create(
                accessKey,
                secretKey,
            ),
        )
    }

    @Bean
    fun s3Client(): S3Client {
        return S3Client.builder()
            .region(region)
            .endpointOverride(endpoint)
            .credentialsProvider(credentialsProvider)
            .forcePathStyle(true)
            .build()
    }

    @Bean
    fun sqsClient(): SqsClient {
        return SqsClient.builder()
            .region(region)
            .endpointOverride(endpoint)
            .credentialsProvider(credentialsProvider)
            .build()
    }
}
