package io.leonfoliveira.judge.adapter.aws

import io.leonfoliveira.judge.core.port.BucketAdapter
import java.util.UUID
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest

@Service
class S3BucketAdapter(
    private val s3Client: S3Client,
    @Value("\${spring.cloud.aws.s3.bucket}")
    private val bucket: String,
) : BucketAdapter {
    override fun upload(bytes: ByteArray, key: UUID) {
        val putObjectRequest = PutObjectRequest
            .builder()
            .bucket(bucket)
            .key(key.toString())
            .build()

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes))
    }

    override fun download(key: UUID): ByteArray {
        val getObjectRequest =
            GetObjectRequest
                .builder()
                .bucket(bucket)
                .key(key.toString())
                .build()

        val s3Object = s3Client.getObject(getObjectRequest)

        return s3Object.readAllBytes()
    }
}
