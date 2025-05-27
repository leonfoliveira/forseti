package io.leonfoliveira.judge.core.service.attachment

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.Attachment
import io.leonfoliveira.judge.core.domain.entity.AttachmentMockFactory
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.repository.AttachmentRepository
import io.leonfoliveira.judge.core.service.dto.output.AttachmentDownloadOutputDTO
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import java.util.Optional
import java.util.UUID
import org.springframework.web.multipart.MultipartFile

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

            result shouldBe attachment
            attachmentSlot.captured.filename shouldBe "test.txt"
            attachmentSlot.captured.contentType shouldBe "text/plain"
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
            val key = UUID.randomUUID()
            val bytes = ByteArray(0)
            val attachment = AttachmentMockFactory.build(key = key)
            every { attachmentRepository.findById(key) } returns Optional.of(attachment)
            every { bucketAdapter.download(key) } returns bytes

            val result = sut.download(key)

            result.attachment shouldBe attachment
            result.bytes shouldBe bytes
        }
    }
})
