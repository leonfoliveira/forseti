package com.forsetijudge.core.infrastructure.s3

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.port.output.bucket.AttachmentBucket
import com.forsetijudge.core.util.SafeLogger
import java.time.Duration
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest

@Component
class AttachmentS3Bucket(
    private val s3PreSigner: S3Presigner,
    private val s3Client: S3Client,
    @Value($$"${spring.cloud.aws.endpoint}")
    private val endpoint: String,
    @Value($$"${spring.cloud.aws.s3.public-endpoint}")
    private val publicEndpoint: String,
    @Value($$"${spring.cloud.aws.s3.bucket}")
    private val bucketName: String,
    @Value($$"${spring.cloud.aws.s3.signed-download-url-expiration-seconds}")
    private val signedDownloadUrlExpirationSeconds: Long,
    @Value($$"${spring.cloud.aws.s3.signed-upload-url-expiration-seconds}")
    private val signedUploadUrlExpirationSeconds: Long,
) : AttachmentBucket {
    private val logger = SafeLogger(this::class)

    companion object {
        const val PREFIX = "attachments/"
    }

    override fun getDownloadUrl(attachment: Attachment): String {
        logger.info("Generating signed download URL for attachment with ID: ${attachment.id}")
        val key = "$PREFIX${attachment.id}"

        val objectRequest =
            GetObjectRequest
                .builder()
                .bucket(bucketName)
                .key(key)
                .build()

        val presignRequest =
            GetObjectPresignRequest
                .builder()
                .signatureDuration(Duration.ofSeconds(signedDownloadUrlExpirationSeconds))
                .getObjectRequest(objectRequest)
                .build()

        val url = s3PreSigner.presignGetObject(presignRequest).url().toString()
        return getPublicUrl(url)
    }

    override fun getUploadUrl(attachment: Attachment): String {
        logger.info("Generating signed upload URL for attachment with ID: ${attachment.id}")
        val key = "$PREFIX${attachment.id}"

        val objectRequest =
            PutObjectRequest
                .builder()
                .bucket(bucketName)
                .key(key)
                .contentType(attachment.contentType)
                .build()

        val presignRequest =
            PutObjectPresignRequest
                .builder()
                .signatureDuration(Duration.ofSeconds(signedUploadUrlExpirationSeconds))
                .putObjectRequest(objectRequest)
                .build()

        val url = s3PreSigner.presignPutObject(presignRequest).url().toString()
        return getPublicUrl(url)
    }

    override fun download(attachment: Attachment): ByteArray {
        logger.info("Downloading attachment with ID: ${attachment.id}")
        val key = "$PREFIX${attachment.id}"

        val objectRequest =
            GetObjectRequest
                .builder()
                .bucket(bucketName)
                .key(key)
                .build()

        return s3Client.getObject(objectRequest).readAllBytes()
    }

    override fun upload(
        attachment: Attachment,
        data: ByteArray,
    ) {
        logger.info("Uploading attachment with ID: ${attachment.id}")
        val key = "$PREFIX${attachment.id}"

        val objectRequest =
            PutObjectRequest
                .builder()
                .bucket(bucketName)
                .key(key)
                .contentType(attachment.contentType)
                .build()

        s3Client.putObject(objectRequest, RequestBody.fromBytes(data))
    }

    private fun getPublicUrl(url: String): String = url.replace(endpoint, publicEndpoint)
}
