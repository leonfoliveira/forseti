package io.leonfoliveira.judge.adapter.aws

import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.NoSuchKeyException
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.util.UUID

@Service
class S3BucketAdapter(
    private val s3Client: S3Client,
    @Value("\${spring.cloud.aws.s3.bucket}")
    private val bucket: String,
) : BucketAdapter {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun upload(
        bytes: ByteArray,
        key: UUID,
    ) {
        logger.info("Uploading attachment with key: $key and size: ${bytes.size}")

        val putObjectRequest =
            PutObjectRequest
                .builder()
                .bucket(bucket)
                .key(key.toString())
                .build()

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes))

        logger.info("Successfully uploaded attachment with key: $key")
    }

    override fun download(key: UUID): ByteArray {
        logger.info("Downloading attachment with key: $key")

        val getObjectRequest =
            GetObjectRequest
                .builder()
                .bucket(bucket)
                .key(key.toString())
                .build()

        val s3Object =
            try {
                s3Client.getObject(getObjectRequest)
            } catch (ex: NoSuchKeyException) {
                throw NotFoundException("Could not find attachment with key: $key")
            }

        val bytes = s3Object.readAllBytes()
        logger.info("Successfully downloaded attachment with key: $key and size: ${bytes.size}")
        return bytes
    }
}
