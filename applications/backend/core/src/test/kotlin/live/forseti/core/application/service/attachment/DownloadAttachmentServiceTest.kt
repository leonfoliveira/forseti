package live.forseti.core.application.service.attachment

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import live.forseti.core.domain.entity.Attachment
import live.forseti.core.domain.entity.AttachmentMockBuilder
import live.forseti.core.domain.entity.ContestMockBuilder
import live.forseti.core.domain.entity.MemberMockBuilder
import live.forseti.core.domain.exception.NotFoundException
import live.forseti.core.port.driven.AttachmentBucket
import live.forseti.core.port.driven.repository.AttachmentRepository
import live.forseti.core.port.driven.repository.ContestRepository
import live.forseti.core.port.driven.repository.MemberRepository
import java.util.UUID

class DownloadAttachmentServiceTest :
    FunSpec({
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val attachmentBucket = mockk<AttachmentBucket>(relaxed = true)

        val sut =
            DownloadAttachmentService(
                attachmentRepository = attachmentRepository,
                attachmentBucket = attachmentBucket,
            )

        beforeEach {
            clearAllMocks()
        }

        context("download - byId") {
            test("should throw NotFoundException when attachment does not exist") {
                val id = UUID.randomUUID()
                every { attachmentRepository.findEntityById(id) } returns null

                shouldThrow<NotFoundException> {
                    sut.download(id)
                }.message shouldBe "Could not find attachment with id = $id"
            }

            test("should download an attachment") {
                val id = UUID.randomUUID()
                val attachment = AttachmentMockBuilder.build(id = id)
                every { attachmentRepository.findEntityById(id) } returns attachment
                val bytes = ByteArray(10) { it.toByte() }
                every { attachmentBucket.download(attachment) } returns bytes

                val result = sut.download(id)

                result.attachment shouldBe attachment
                result.bytes shouldBe bytes
            }
        }

        context("download - byEntity") {
            test("should download an attachment") {
                val id = UUID.randomUUID()
                val attachment = AttachmentMockBuilder.build(id = id)
                every { attachmentRepository.findEntityById(id) } returns attachment
                val bytes = ByteArray(10) { it.toByte() }
                every { attachmentBucket.download(attachment) } returns bytes

                val result = sut.download(attachment)

                result shouldBe bytes
            }
        }
    })
