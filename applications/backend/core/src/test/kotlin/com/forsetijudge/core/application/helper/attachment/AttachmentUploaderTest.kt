package com.forsetijudge.core.application.helper.attachment

import com.forsetijudge.core.application.helper.attachment.AttachmentUploader
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.event.AttachmentEvent
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.bucket.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher

class AttachmentUploaderTest :
    FunSpec({
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val attachmentBucket = mockk<AttachmentBucket>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            AttachmentUploader(
                attachmentRepository,
                attachmentBucket,
                applicationEventPublisher,
            )

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build()
        }

        test("upload attachment") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build()
            val filename = "test.txt"
            val contentType = "text/plain"
            val context = Attachment.Context.PROBLEM_DESCRIPTION
            val bytes = "Hello, World!".toByteArray()

            every { attachmentRepository.save(any()) } returnsArgument 0
            every { attachmentBucket.upload(any(), any()) } returns Unit
            every { applicationEventPublisher.publishEvent(any<AttachmentEvent.Uploaded>()) } returns Unit

            val result =
                sut.upload(
                    contest = contest,
                    member = member,
                    filename = filename,
                    contentType = contentType,
                    context = context,
                    bytes = bytes,
                )

            val attachmentSlot = slot<Attachment>()
            verify { attachmentRepository.save(capture(attachmentSlot)) }
            val attachment = attachmentSlot.captured
            result.first shouldBe attachment
            attachment.contest shouldBe contest
            attachment.member shouldBe member
            attachment.filename shouldBe filename
            attachment.contentType shouldBe contentType
            attachment.context shouldBe context
            verify { attachmentBucket.upload(attachment, bytes) }
            verify { applicationEventPublisher.publishEvent(match<AttachmentEvent.Uploaded> { it.attachmentId == attachment.id }) }
        }

        test("upload attachment without optional fields") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build()
            val context = Attachment.Context.PROBLEM_DESCRIPTION
            val bytes = "Hello, World!".toByteArray()

            every { attachmentRepository.save(any()) } returnsArgument 0
            every { attachmentBucket.upload(any(), any()) } returns Unit
            every { applicationEventPublisher.publishEvent(any<AttachmentEvent.Uploaded>()) } returns Unit

            val result =
                sut.upload(
                    contest = contest,
                    member = member,
                    filename = null,
                    contentType = null,
                    context = context,
                    bytes = bytes,
                )

            val attachmentSlot = slot<Attachment>()
            verify { attachmentRepository.save(capture(attachmentSlot)) }
            val attachment = attachmentSlot.captured
            result.first shouldBe attachment
            attachment.contest shouldBe contest
            attachment.member shouldBe member
            attachment.filename shouldBe attachment.id.toString()
            attachment.contentType shouldBe "application/octet-stream"
            attachment.context shouldBe context
            verify { attachmentBucket.upload(attachment, bytes) }
            verify { applicationEventPublisher.publishEvent(match<AttachmentEvent.Uploaded> { it.attachmentId == attachment.id }) }
        }
    })
