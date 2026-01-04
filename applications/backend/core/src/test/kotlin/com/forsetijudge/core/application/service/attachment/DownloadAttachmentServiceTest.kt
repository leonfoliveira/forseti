package com.forsetijudge.core.application.service.attachment

import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk

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
                val id = UuidCreator.getTimeOrderedEpoch()
                every { attachmentRepository.findEntityById(id) } returns null

                shouldThrow<NotFoundException> {
                    sut.download(id)
                }.message shouldBe "Could not find attachment with id = $id"
            }

            test("should download an attachment") {
                val id = UuidCreator.getTimeOrderedEpoch()
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
                val id = UuidCreator.getTimeOrderedEpoch()
                val attachment = AttachmentMockBuilder.build(id = id)
                every { attachmentRepository.findEntityById(id) } returns attachment
                val bytes = ByteArray(10) { it.toByte() }
                every { attachmentBucket.download(attachment) } returns bytes

                val result = sut.download(attachment)

                result shouldBe bytes
            }
        }
    })
