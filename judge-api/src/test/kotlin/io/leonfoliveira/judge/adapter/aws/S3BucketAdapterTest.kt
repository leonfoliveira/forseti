package io.leonfoliveira.judge.adapter.aws

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import software.amazon.awssdk.core.ResponseInputStream
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.GetObjectResponse
import software.amazon.awssdk.services.s3.model.NoSuchKeyException
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectResponse
import java.util.UUID
import kotlin.toString

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
            val key = UUID.randomUUID()
            val bytes = ByteArray(0)
            val requestSlot = slot<PutObjectRequest>()

            every { s3Client.putObject(capture(requestSlot), any<RequestBody>()) } returns mockk<PutObjectResponse>()

            sut.upload(bytes, key)

            requestSlot.captured.bucket() shouldBe bucket
            requestSlot.captured.key() shouldBe key.toString()
        }
    }

    context("download") {
        test("should download the file from S3") {
            val key = UUID.randomUUID()
            val bytes = ByteArray(0)
            val requestSlot = slot<GetObjectRequest>()

            val responseInputStream = mockk<ResponseInputStream<GetObjectResponse>>()
            every { responseInputStream.readAllBytes() } returns bytes
            every { s3Client.getObject(capture(requestSlot)) }
                .returns(responseInputStream)

            val result = sut.download(key)

            requestSlot.captured.bucket() shouldBe bucket
            requestSlot.captured.key() shouldBe key.toString()
            result shouldBe bytes
        }

        test("should throw NotFoundException when file does not exist") {
            val key = UUID.randomUUID()
            val requestSlot = slot<GetObjectRequest>()

            every { s3Client.getObject(capture(requestSlot)) } throws
                NoSuchKeyException.builder().build()

            shouldThrow<NotFoundException> {
                sut.download(key)
            }
        }
    }
})
