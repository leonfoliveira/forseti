package com.forsetijudge.infrastructure.adapter.driven.minio

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.port.driven.bucket.AttachmentBucket
import io.minio.GetObjectArgs
import io.minio.MinioClient
import io.minio.PutObjectArgs
import io.minio.RemoveObjectsArgs
import io.minio.messages.DeleteObject
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class MinioAttachmentBucket(
    private val minioClient: MinioClient,
    @Value("\${minio.bucket}")
    private val bucket: String,
) : AttachmentBucket {
    private val logger = SafeLogger(this::class)

    override fun upload(
        attachment: Attachment,
        bytes: ByteArray,
    ) {
        val key = attachment.id.toString()
        logger.info("Uploading ${bytes.size} bytes with key: $key")

        val putObjectRequest =
            PutObjectArgs
                .builder()
                .bucket(bucket)
                .`object`(key)
                .stream(bytes.inputStream(), bytes.size.toLong(), -1)
                .contentType(attachment.contentType)
                .build()

        minioClient.putObject(putObjectRequest)

        logger.info("Successfully uploaded")
    }

    override fun download(attachment: Attachment): ByteArray {
        val key = attachment.id.toString()
        logger.info("Downloading file with key: $key")

        val getObjectArgs =
            GetObjectArgs
                .builder()
                .bucket(bucket)
                .`object`(key)
                .build()

        val s3Object = minioClient.getObject(getObjectArgs)

        val bytes = s3Object.readAllBytes()
        logger.info("Successfully downloaded file with size: ${bytes.size}")
        return bytes
    }

    override fun deleteAll(attachments: List<Attachment>) {
        logger.info("Deleting ${attachments.size} attachments")

        val removeObjectArgs =
            RemoveObjectsArgs
                .builder()
                .bucket(bucket)
                .objects(attachments.map { DeleteObject(it.id.toString()) })
                .build()

        minioClient.removeObjects(removeObjectArgs)

        logger.info("Successfully deleted attachments")
    }
}
