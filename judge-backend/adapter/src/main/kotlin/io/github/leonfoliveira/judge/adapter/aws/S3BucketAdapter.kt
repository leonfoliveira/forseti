package io.github.leonfoliveira.judge.adapter.aws

import io.github.leonfoliveira.judge.core.domain.entity.Attachment
import io.github.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.core.port.BucketAdapter
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.NoSuchKeyException
import software.amazon.awssdk.services.s3.model.PutObjectRequest

@Service
class S3BucketAdapter(
    private val s3Client: S3Client,
    @Value("\${spring.cloud.aws.s3.bucket}")
    private val bucket: String,
) : BucketAdapter {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun upload(
        attachment: Attachment,
        bytes: ByteArray,
    ) {
        logger.info("Uploading $bytes bytes to S3 bucket: $bucket with key: ${attachment.id}")

        val putObjectRequest =
            PutObjectRequest
                .builder()
                .bucket(bucket)
                .key(attachment.id.toString())
                .build()

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes))

        logger.info("Successfully uploaded")
    }

    override fun download(attachment: Attachment): ByteArray {
        logger.info("Downloading attachment with key: ${attachment.id} from S3 bucket: $bucket")

        val getObjectRequest =
            GetObjectRequest
                .builder()
                .bucket(bucket)
                .key(attachment.id.toString())
                .build()

        val s3Object =
            try {
                s3Client.getObject(getObjectRequest)
            } catch (ex: NoSuchKeyException) {
                throw NotFoundException("Could not find attachment with key: ${attachment.id}")
            }

        val bytes = s3Object.readAllBytes()
        logger.info("Successfully downloaded attachment with key: ${attachment.id} and size: ${bytes.size}")
        return bytes
    }
}
