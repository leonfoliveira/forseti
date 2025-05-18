package io.leonfoliveira.judge.adapter.aws

import io.leonfoliveira.judge.core.domain.model.Attachment
import io.leonfoliveira.judge.core.domain.model.DownloadAttachment
import io.leonfoliveira.judge.core.domain.model.UploadAttachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest
import java.time.Duration
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
class S3BucketAdapter(
    private val s3Client: S3Client,
    private val s3PreSigner: S3Presigner,
    @Value("\${spring.cloud.aws.s3.bucket}")
    private val bucket: String,
) : BucketAdapter {
    override fun createUploadAttachment(): UploadAttachment {
        val key = UUID.randomUUID().toString()

        val putObjectRequest =
            PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build()

        val presignRequest =
            PutObjectPresignRequest.builder()
                .signatureDuration(Duration.of(15, ChronoUnit.MINUTES))
                .putObjectRequest(putObjectRequest)
                .build()
        val url = s3PreSigner.presignPutObject(presignRequest).url().toString()

        return UploadAttachment(key, url)
    }

    override fun createDownloadAttachment(attachment: Attachment): DownloadAttachment {
        val getObjectRequest =
            GetObjectRequest
                .builder()
                .bucket(bucket)
                .key(attachment.key)
                .build()

        val presignRequest =
            GetObjectPresignRequest.builder()
                .signatureDuration(Duration.of(15, ChronoUnit.MINUTES))
                .getObjectRequest(getObjectRequest)
                .build()

        val url = s3PreSigner.presignGetObject(presignRequest).url().toString()
        return DownloadAttachment(
            filename = attachment.filename,
            url = url,
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
