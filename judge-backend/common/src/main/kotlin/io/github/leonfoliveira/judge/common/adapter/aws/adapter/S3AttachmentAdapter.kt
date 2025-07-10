package io.github.leonfoliveira.judge.common.adapter.aws.adapter

import io.github.leonfoliveira.judge.common.adapter.aws.S3Adapter
import io.github.leonfoliveira.judge.common.domain.entity.Attachment
import io.github.leonfoliveira.judge.common.port.BucketAdapter
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class S3AttachmentAdapter(
    private val s3Adapter: S3Adapter,
    @Value("\${spring.cloud.aws.s3.bucket}")
    private val bucket: String,
) : BucketAdapter {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun upload(
        attachment: Attachment,
        bytes: ByteArray,
    ) {
        logger.info("Uploading attachment with ID: ${attachment.id} to S3 bucket: $bucket")

        s3Adapter.upload(bucket, attachment.id.toString(), bytes)

        logger.info("Successfully uploaded")
    }

    override fun download(attachment: Attachment): ByteArray {
        logger.info("Downloading attachment with ID: ${attachment.id} from S3 bucket: $bucket")

        val bytes = s3Adapter.download(bucket, attachment.id.toString())

        logger.info("Successfully downloaded attachment")
        return bytes
    }
}
