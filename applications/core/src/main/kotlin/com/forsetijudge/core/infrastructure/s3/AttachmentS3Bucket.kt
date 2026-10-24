package com.forsetijudge.core.infrastructure.s3

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.infrastructure.s3.adapter.S3Bucket
import com.forsetijudge.core.port.output.bucket.AttachmentBucket
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.presigner.S3Presigner

@Component
class AttachmentS3Bucket(
    s3PreSigner: S3Presigner,
    s3Client: S3Client,
    @Value($$"${aws.s3.bucket}")
    private val bucketName: String,
    @Value($$"${aws.s3.signed-download-url-expiration-seconds}")
    private val signedDownloadUrlExpirationSeconds: Long,
    @Value($$"${aws.s3.signed-upload-url-expiration-seconds}")
    private val signedUploadUrlExpirationSeconds: Long,
) : AttachmentBucket {
    private val s3Bucket =
        S3Bucket(
            s3PreSigner,
            s3Client,
            bucketName,
            signedDownloadUrlExpirationSeconds,
            signedUploadUrlExpirationSeconds,
        )

    companion object {
        const val PREFIX = "attachments/"
    }

    override fun getDownloadUrl(attachment: Attachment): String = s3Bucket.getDownloadUrl("$PREFIX${attachment.id}")

    override fun getUploadUrl(attachment: Attachment): String =
        s3Bucket.getUploadUrl(
            key = "$PREFIX${attachment.id}",
            contentType = attachment.contentType,
        )

    override fun download(attachment: Attachment): ByteArray = s3Bucket.download("$PREFIX${attachment.id}")

    override fun upload(
        attachment: Attachment,
        data: ByteArray,
    ) = s3Bucket.upload(
        key = "$PREFIX${attachment.id}",
        contentType = attachment.contentType,
        data = data,
    )
}
