package io.github.leonfoliveira.judge.common.adapter.aws.adapter

import io.github.leonfoliveira.judge.common.adapter.aws.S3Adapter
import io.github.leonfoliveira.judge.common.mock.AttachmentMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class S3AttachmentAdapterTest : FunSpec({
    val s3Adapter = mockk<S3Adapter>(relaxed = true)
    val bucketName = "test-bucket"

    val sut = S3AttachmentAdapter(s3Adapter, bucketName)

    test("should call S3Adapter to upload an attachment") {
        val attachment = AttachmentMockBuilder.build()
        val bytes = ByteArray(10) { it.toByte() }

        sut.upload(attachment, bytes)

        verify { s3Adapter.upload(bucketName, attachment.id.toString(), bytes) }
    }

    test("should call S3Adapter to download an attachment") {
        val attachment = AttachmentMockBuilder.build()
        val bytes = ByteArray(10) { it.toByte() }
        every { s3Adapter.download(bucketName, attachment.id.toString()) } returns bytes

        val result = sut.download(attachment)

        result shouldBe bytes
        verify { s3Adapter.download(bucketName, attachment.id.toString()) }
    }
})
