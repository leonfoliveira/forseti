package io.github.leonfoliveira.judge.common.service.attachment

import io.github.leonfoliveira.judge.common.domain.entity.Attachment
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.judge.common.port.BucketAdapter
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.Optional
import java.util.UUID
import org.springframework.web.multipart.MultipartFile

class AttachmentServiceTest : FunSpec({
    val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
    val bucketAdapter = mockk<BucketAdapter>(relaxed = true)

    val sut = AttachmentService(
        attachmentRepository = attachmentRepository,
        bucketAdapter = bucketAdapter,
    )

    beforeEach {
        clearAllMocks()
    }

    context("upload") {
        test("should upload an attachment") {
            val file = mockk<MultipartFile>(relaxed = true)
            every { file.originalFilename } returns "test.txt"
            every { file.contentType } returns "text/plain"
            val bytes = ByteArray(10) { it.toByte() }
            every { file.bytes } returns bytes
            every { attachmentRepository.save(any<Attachment>()) } answers { firstArg() }

            val attachment = sut.upload(file)

            attachment.filename shouldBe "test.txt"
            attachment.contentType shouldBe "text/plain"
            verify { attachmentRepository.save(attachment) }
            verify { bucketAdapter.upload(attachment, bytes) }
        }
    }

    context("download") {
        test("should throw NotFoundException when attachment does not exist") {
            val id = UUID.randomUUID()
            every { attachmentRepository.findById(id) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.download(id)
            }.message shouldBe "Could not find attachment with id = $id"
        }

        test("should download an attachment") {
            val id = UUID.randomUUID()
            val attachment = AttachmentMockBuilder.build(id = id)
            every { attachmentRepository.findById(id) } returns Optional.of(attachment)
            val bytes = ByteArray(10) { it.toByte() }
            every { bucketAdapter.download(attachment) } returns bytes

            val result = sut.download(id)

            result.attachment shouldBe attachment
            result.bytes shouldBe bytes
        }
    }
})
