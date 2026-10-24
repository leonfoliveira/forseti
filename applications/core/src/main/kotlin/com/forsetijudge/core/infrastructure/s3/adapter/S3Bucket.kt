package com.forsetijudge.core.infrastructure.s3.adapter

import com.forsetijudge.core.util.SafeLogger
import java.time.Duration
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest

class S3Bucket(
    private val s3PreSigner: S3Presigner,
    private val s3Client: S3Client,
    private val bucketName: String,
    private val signedDownloadUrlExpirationSeconds: Long,
    private val signedUploadUrlExpirationSeconds: Long,
) {
    private val logger = SafeLogger(this::class)

    fun getDownloadUrl(key: String): String {
        logger.info("Generating signed download URL for file with key: $key")

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

        return s3PreSigner.presignGetObject(presignRequest).url().toString()
    }

    fun getUploadUrl(
        key: String,
        contentType: String,
    ): String {
        logger.info("Generating signed upload URL for file with key: $key")

        val objectRequest =
            PutObjectRequest
                .builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build()

        val presignRequest =
            PutObjectPresignRequest
                .builder()
                .signatureDuration(Duration.ofSeconds(signedUploadUrlExpirationSeconds))
                .putObjectRequest(objectRequest)
                .build()

        return s3PreSigner.presignPutObject(presignRequest).url().toString()
    }

    fun download(key: String): ByteArray {
        logger.info("Downloading file with key: $key")

        val objectRequest =
            GetObjectRequest
                .builder()
                .bucket(bucketName)
                .key(key)
                .build()

        return s3Client.getObject(objectRequest).readAllBytes()
    }

    fun upload(
        key: String,
        contentType: String,
        data: ByteArray,
    ) {
        logger.info("Uploading file with key: $key")

        val objectRequest =
            PutObjectRequest
                .builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build()

        s3Client.putObject(objectRequest, RequestBody.fromBytes(data))
    }
}
