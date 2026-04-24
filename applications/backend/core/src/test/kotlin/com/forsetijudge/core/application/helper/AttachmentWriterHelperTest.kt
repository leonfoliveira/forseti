package com.forsetijudge.core.application.helper

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class AttachmentWriterHelperTest :
    FunSpec({
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)

        val sut =
            AttachmentWriterHelper(
                attachmentRepository = attachmentRepository,
            )

        context("commit") {
            val attachmentId = IdGenerator.getUUID()
            val contestId = IdGenerator.getUUID()
            val context = Attachment.Context.SUBMISSION_CODE

            test("should throw NotFoundException when attachment is not found") {
                every { attachmentRepository.findByIdAndContestId(attachmentId, contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.commit(
                        attachmentId = attachmentId,
                        contestId = contestId,
                        context = context,
                    )
                }.message shouldBe "Attachment with id $attachmentId not found in contest with id $contestId"
            }

            test("should throw ForbiddenException when attachment is already commited") {
                val attachment = AttachmentMockBuilder.build(isCommited = true)
                every { attachmentRepository.findByIdAndContestId(attachmentId, contestId) } returns attachment

                shouldThrow<ForbiddenException> {
                    sut.commit(
                        attachmentId = attachmentId,
                        contestId = contestId,
                        context = context,
                    )
                }.message shouldBe "Attachment with id $attachmentId is already commited"
            }

            test("should throw ForbiddenException when attachment has invalid context") {
                val attachment = AttachmentMockBuilder.build(isCommited = false, context = Attachment.Context.PROBLEM_DESCRIPTION)
                every { attachmentRepository.findByIdAndContestId(attachmentId, contestId) } returns attachment

                shouldThrow<ForbiddenException> {
                    sut.commit(
                        attachmentId = attachmentId,
                        contestId = contestId,
                        context = context,
                    )
                }.message shouldBe "Attachment with id $attachmentId has invalid context ${attachment.context}"
            }

            test("should commit attachment successfully") {
                val attachment = AttachmentMockBuilder.build(isCommited = false, context = context)
                every { attachmentRepository.findByIdAndContestId(attachmentId, contestId) } returns attachment
                every { attachmentRepository.save(any()) } returnsArgument 0

                val result =
                    sut.commit(
                        attachmentId = attachmentId,
                        contestId = contestId,
                        context = context,
                    )

                result shouldBe attachment
                result.isCommited shouldBe true
                verify { attachmentRepository.save(result) }
            }
        }
    })
