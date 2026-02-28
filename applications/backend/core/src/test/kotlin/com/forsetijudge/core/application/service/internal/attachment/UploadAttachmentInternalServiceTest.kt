package com.forsetijudge.core.application.service.internal.attachment

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.event.AttachmentsEvent
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.bucket.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driving.usecase.internal.attachment.UploadAttachmentInternalUseCase
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher

class UploadAttachmentInternalServiceTest :
    FunSpec({
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val attachmentBucket = mockk<AttachmentBucket>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            UploadAttachmentInternalService(
                attachmentRepository,
                attachmentBucket,
                applicationEventPublisher,
            )

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build()
        }

        test("upload attachment") {
            val command =
                UploadAttachmentInternalUseCase.Command(
                    contest = ContestMockBuilder.build(),
                    member = MemberMockBuilder.build(),
                    filename = "test.txt",
                    contentType = "text/plain",
                    context = Attachment.Context.PROBLEM_DESCRIPTION,
                    bytes = "Hello, World!".toByteArray(),
                )

            every { attachmentRepository.save(any()) } returnsArgument 0
            every { attachmentBucket.upload(any(), any()) } returns Unit
            every { applicationEventPublisher.publishEvent(any<AttachmentsEvent.Uploaded>()) } returns Unit

            val result = sut.execute(command)

            val attachmentSlot = slot<Attachment>()
            verify { attachmentRepository.save(capture(attachmentSlot)) }
            val attachment = attachmentSlot.captured
            result.first shouldBe attachment
            attachment.contest shouldBe command.contest
            attachment.member shouldBe command.member
            attachment.filename shouldBe command.filename
            attachment.contentType shouldBe command.contentType
            attachment.context shouldBe command.context
            verify { attachmentBucket.upload(attachment, command.bytes) }
            verify { applicationEventPublisher.publishEvent(match<AttachmentsEvent.Uploaded> { it.attachment == attachment }) }
        }

        test("upload attachment without optional fields") {
            val command =
                UploadAttachmentInternalUseCase.Command(
                    contest = ContestMockBuilder.build(),
                    member = MemberMockBuilder.build(),
                    filename = null,
                    contentType = null,
                    context = Attachment.Context.PROBLEM_DESCRIPTION,
                    bytes = "Hello, World!".toByteArray(),
                )

            every { attachmentRepository.save(any()) } returnsArgument 0
            every { attachmentBucket.upload(any(), any()) } returns Unit
            every { applicationEventPublisher.publishEvent(any<AttachmentsEvent.Uploaded>()) } returns Unit

            val result = sut.execute(command)

            val attachmentSlot = slot<Attachment>()
            verify { attachmentRepository.save(capture(attachmentSlot)) }
            val attachment = attachmentSlot.captured
            result.first shouldBe attachment
            attachment.contest shouldBe command.contest
            attachment.member shouldBe command.member
            attachment.filename shouldBe attachment.id.toString()
            attachment.contentType shouldBe "application/octet-stream"
            attachment.context shouldBe command.context
            verify { attachmentBucket.upload(attachment, command.bytes) }
            verify { applicationEventPublisher.publishEvent(match<AttachmentsEvent.Uploaded> { it.attachment == attachment }) }
        }
    })
