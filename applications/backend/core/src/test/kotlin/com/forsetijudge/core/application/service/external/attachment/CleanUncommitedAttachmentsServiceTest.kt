package com.forsetijudge.core.application.service.external.attachment

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.bucket.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class CleanUncommitedAttachmentsServiceTest :
    FunSpec({
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val attachmentBucket = mockk<AttachmentBucket>(relaxed = true)

        val sut =
            CleanUncommitedAttachmentsService(
                memberRepository = memberRepository,
                attachmentRepository = attachmentRepository,
                attachmentBucket = attachmentBucket,
            )

        val memberId = IdGenerator.getUUID()

        beforeTest {
            clearAllMocks()
            ExecutionContextMockBuilder.build(memberId = memberId)
        }

        test("should throw NotFoundException if member is not found") {
            every { memberRepository.findById(memberId) } returns null

            shouldThrow<NotFoundException> { sut.execute() }
        }

        Member.Type.entries.filter { it != Member.Type.API }.forEach { memberType ->
            test("should throw ForbiddenException if member is of type $memberType") {
                every { memberRepository.findById(memberId) } returns MemberMockBuilder.build(id = memberId, type = memberType)

                shouldThrow<ForbiddenException> { sut.execute() }
            }
        }

        test("should clean up attachments") {
            val attachmentsToClean =
                listOf(
                    AttachmentMockBuilder.build(),
                    AttachmentMockBuilder.build(),
                )
            every { memberRepository.findById(memberId) } returns MemberMockBuilder.build(id = memberId, type = Member.Type.API)
            every { attachmentRepository.findAllByIsCommitedFalseAndCreatedAtLessThan(any()) } returns attachmentsToClean
            every { attachmentRepository.saveAll(any()) } returnsArgument 0

            sut.execute()

            attachmentsToClean.forEach { it.deletedAt shouldBe ExecutionContext.get().startedAt }
            verify { attachmentBucket.deleteAll(attachmentsToClean) }
            verify { attachmentRepository.saveAll(attachmentsToClean) }
        }
    })
