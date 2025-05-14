package io.leonfoliveira.judge.adapter.aws

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.model.Attachment
import io.leonfoliveira.judge.core.domain.model.RawAttachment
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import software.amazon.awssdk.core.ResponseInputStream
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.GetObjectResponse
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.util.UUID

class S3BucketAdapterTest : FunSpec({
    val s3Client = mockk<S3Client>()
    val bucket = "bucket"

    val sut =
        S3BucketAdapter(
            s3Client = s3Client,
            bucket = bucket,
        )

    context("upload") {
        test("should upload the file to S3") {
            val rawAttachment =
                RawAttachment(
                    filename = "file.txt",
                    content = ByteArray(0),
                )
            val requestSlot = slot<PutObjectRequest>()
            val bodySlot = slot<RequestBody>()

            every {
                s3Client.putObject(
                    capture(requestSlot),
                    capture(bodySlot),
                )
            }
                .returns(null)

            val attachment = sut.upload(rawAttachment)

            requestSlot.captured.bucket() shouldBe bucket
            requestSlot.captured.key() shouldBe attachment.key
            bodySlot.captured.contentStreamProvider().newStream().readAllBytes() shouldBe rawAttachment.content
            attachment.filename shouldBe rawAttachment.filename
            attachment.key shouldBe attachment.key
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
