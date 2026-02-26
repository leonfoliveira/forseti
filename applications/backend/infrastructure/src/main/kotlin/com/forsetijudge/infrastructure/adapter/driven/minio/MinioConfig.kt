package com.forsetijudge.infrastructure.adapter.driven.minio

import com.forsetijudge.core.application.util.SafeLogger
import io.minio.BucketExistsArgs
import io.minio.MakeBucketArgs
import io.minio.MinioClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.event.EventListener

@Configuration
class MinioConfig(
    @Value("\${minio.endpoint}")
    private val endpoint: String,
    @Value("\${minio.access-key}")
    private val accessKey: String,
    @Value("\${minio.secret-key}")
    private val secretKey: String,
    @Value("\${minio.bucket}")
    private val bucket: String,
) {
    private val logger = SafeLogger(this::class)

    @Bean
    fun minioClient(): MinioClient =
        MinioClient
            .builder()
            .endpoint(endpoint)
            .credentials(accessKey, secretKey)
            .build()

    /**
     * Create the bucket if it does not exist on application startup
     */
    @EventListener(ApplicationReadyEvent::class)
    fun init() {
        val client = minioClient()
        val isBucketExistent = client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build())
        if (!isBucketExistent) {
            logger.info("Bucket $bucket does not exist. Creating...")
            client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build())
        } else {
            logger.info("Bucket $bucket already exists.")
        }
    }
}
