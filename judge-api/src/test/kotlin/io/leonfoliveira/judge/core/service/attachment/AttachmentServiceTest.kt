package io.leonfoliveira.judge.core.service.attachment

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.Attachment
import io.leonfoliveira.judge.core.domain.entity.AttachmentMockFactory
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.repository.AttachmentRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import org.springframework.web.multipart.MultipartFile
import java.util.Optional
import java.util.UUID

class AttachmentServiceTest : FunSpec({
    val attachmentRepository = mockk<AttachmentRepository>()
    val bucketAdapter = mockk<BucketAdapter>()

    val sut = AttachmentService(attachmentRepository, bucketAdapter)

    context("upload") {
        test("should upload attachment") {
            val file = mockk<MultipartFile>()
            every { file.bytes }.returns(ByteArray(0))
            every { file.originalFilename }.returns("test.txt")
            every { file.contentType }.returns("text/plain")
            val attachment = AttachmentMockFactory.build()
            val attachmentSlot = slot<Attachment>()
            every { attachmentRepository.save(capture(attachmentSlot)) } returns attachment
            every { bucketAdapter.upload(any(), any()) } returns Unit

            val result = sut.upload(file)

            result shouldBe attachmentSlot.captured
            attachmentSlot.captured.filename shouldBe "test.txt"
            attachmentSlot.captured.contentType shouldBe "text/plain"
        }

        test("should upload attachment with default filename and content type") {
            val file = mockk<MultipartFile>()
            every { file.bytes }.returns(ByteArray(0))
            every { file.originalFilename }.returns(null)
            every { file.contentType }.returns(null)
            val attachment = AttachmentMockFactory.build()
            val attachmentSlot = slot<Attachment>()
            every { attachmentRepository.save(capture(attachmentSlot)) } returns attachment
            every { bucketAdapter.upload(any(), any()) } returns Unit

            val result = sut.upload(file)

            result shouldBe attachmentSlot.captured
            attachmentSlot.captured.filename shouldBe attachmentSlot.captured.id.toString()
            attachmentSlot.captured.contentType shouldBe "application/octet-stream"
        }
    }

    context("download") {
        test("should throw NotFoundException when attachment does not exist") {
            every { attachmentRepository.findById(any()) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.download(UUID.randomUUID())
            }
        }

        test("should download attachment") {
            val id = UUID.randomUUID()
            val bytes = ByteArray(0)
            val attachment = AttachmentMockFactory.build(id = id)
            every { attachmentRepository.findById(id) } returns Optional.of(attachment)
            every { bucketAdapter.download(attachment) } returns bytes

            val result = sut.download(id)

            result.attachment shouldBe attachment
            result.bytes shouldBe bytes
        }
    }
})
