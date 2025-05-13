package io.leonfoliveira.judge.adapter.aws

import io.leonfoliveira.judge.core.domain.model.Attachment
import io.leonfoliveira.judge.core.domain.model.RawAttachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.util.UUID

@Service
class S3BucketAdapter(
    private val s3Client: S3Client,
) : BucketAdapter {
    @Value("\${spring.cloud.aws.s3.bucket}")
    private lateinit var bucket: String

    override fun upload(rawAttachment: RawAttachment): Attachment {
        val key = UUID.randomUUID().toString()
        val putObjectRequest =
            PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build()

        s3Client.putObject(
            putObjectRequest,
            RequestBody.fromBytes(rawAttachment.content),
        )

        return Attachment(
            filename = rawAttachment.filename,
            key = key,
        )
    }

    override fun download(attachment: Attachment): ByteArray {
        val getObjectRequest =
            GetObjectRequest
                .builder()
                .bucket(bucket)
                .key(attachment.key)
                .build()

        val s3Object = s3Client.getObject(getObjectRequest)

        return s3Object.readAllBytes()
    }
}
