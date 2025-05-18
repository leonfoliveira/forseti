package io.leonfoliveira.judge.adapter.aws

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.model.Attachment
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import software.amazon.awssdk.core.ResponseInputStream
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.GetObjectResponse
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest
import java.util.UUID
import kotlin.toString

class S3BucketAdapterTest : FunSpec({
    val s3Client = mockk<S3Client>()
    val s3PreSigner = mockk<S3Presigner>()
    val bucket = "bucket"

    val sut =
        S3BucketAdapter(
            s3Client = s3Client,
            s3PreSigner = s3PreSigner,
            bucket = bucket,
        )

    context("createUploadAttachment") {
        test("should return a valid UploadAttachment with a signed URL") {
            val signedUrl = "https://example.com/signed-url"

            every { s3PreSigner.presignPutObject(any<PutObjectPresignRequest>()) } returns
                mockk {
                    every { url().toString() } returns signedUrl
                }

            val result = sut.createUploadAttachment()

            result.url shouldBe signedUrl
        }
    }

    context("createDownloadAttachment") {
        test("return a valid DownloadAttachment with a signed URL") {
            val attachment = Attachment("test.txt", UUID.randomUUID().toString())
            val signedUrl = "https://example.com/signed-url"

            every { s3PreSigner.presignGetObject(any<GetObjectPresignRequest>()) } returns
                mockk {
                    every { url().toString() } returns signedUrl
                }

            val result = sut.createDownloadAttachment(attachment)

            result.filename shouldBe attachment.filename
            result.url shouldBe signedUrl
        }
    }

    context("download") {
        test("should download the file from S3") {
            val attachment = Attachment("test.txt", UUID.randomUUID().toString())
            val content = ByteArray(0)
            val requestSlot = slot<GetObjectRequest>()

            val responseInputStream = mockk<ResponseInputStream<GetObjectResponse>>()
            every { responseInputStream.readAllBytes() } returns content
            every { s3Client.getObject(capture(requestSlot)) }
                .returns(responseInputStream)

            val result = sut.download(attachment)

            requestSlot.captured.bucket() shouldBe bucket
            requestSlot.captured.key() shouldBe attachment.key
            result shouldBe content
        }
    }
})
