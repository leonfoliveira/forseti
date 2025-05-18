package io.leonfoliveira.judge.core.service.attachment

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.model.UploadAttachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.mockk.every
import io.mockk.mockk

class CreateUploadAttachmentServiceTest : FunSpec({
    val bucketAdapter = mockk<BucketAdapter>()

    val sut = CreateUploadAttachmentService(bucketAdapter)

    context("create") {
        test("should create an upload attachment") {
            val uploadAttachment =
                UploadAttachment(
                    url = "test-url",
                    key = "test-key",
                )
            every { bucketAdapter.createUploadAttachment() } returns uploadAttachment

            val result = sut.create()

            result shouldBe uploadAttachment
        }
    }
})
