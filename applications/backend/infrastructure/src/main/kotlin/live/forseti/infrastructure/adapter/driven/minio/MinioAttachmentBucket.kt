package live.forseti.infrastructure.adapter.driven.minio

import io.minio.GetObjectArgs
import io.minio.MinioClient
import io.minio.PutObjectArgs
import live.forseti.core.domain.entity.Attachment
import live.forseti.core.port.driven.AttachmentBucket
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class MinioAttachmentBucket(
    private val minioClient: MinioClient,
    @Value("\${minio.bucket}")
    private val bucket: String,
) : AttachmentBucket {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Uploads an attachment to the MinIO bucket
     *
     * @param attachment the attachment metadata
     * @param bytes the attachment content
     */
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

    /**
     * Downloads an attachment from the MinIO bucket
     *
     * @param attachment the attachment metadata
     * @return the attachment content as a byte array
     */
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
}
