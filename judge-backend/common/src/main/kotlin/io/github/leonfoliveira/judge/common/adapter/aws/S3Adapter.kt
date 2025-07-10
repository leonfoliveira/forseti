package io.github.leonfoliveira.judge.common.adapter.aws

import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.NoSuchKeyException
import software.amazon.awssdk.services.s3.model.PutObjectRequest

@Service
class S3Adapter(
    private val s3Client: S3Client,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun upload(
        bucket: String,
        key: String,
        bytes: ByteArray,
    ) {
        logger.info("Uploading $bytes bytes to S3 bucket: $bucket with key: $key")

        val putObjectRequest =
            PutObjectRequest
                .builder()
                .bucket(bucket)
                .key(key)
                .build()

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes))

        logger.info("Successfully uploaded")
    }

    fun download(bucket: String, key: String): ByteArray {
        logger.info("Downloading attachment with key: $key from S3 bucket: $bucket")

        val getObjectRequest =
            GetObjectRequest
                .builder()
                .bucket(bucket)
                .key(key)
                .build()

        val s3Object =
            try {
                s3Client.getObject(getObjectRequest)
            } catch (ex: NoSuchKeyException) {
                throw NotFoundException("Could not find attachment")
            }

        val bytes = s3Object.readAllBytes()
        logger.info("Successfully downloaded attachment with size: ${bytes.size}")
        return bytes
    }
}
