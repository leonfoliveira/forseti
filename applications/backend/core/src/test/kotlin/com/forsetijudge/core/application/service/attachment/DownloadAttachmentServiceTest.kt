package com.forsetijudge.core.application.service.attachment

import com.forsetijudge.core.application.service.attachment.auth.AttachmentAuthorizationConfig
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.justRun
import io.mockk.mockk

class DownloadAttachmentServiceTest :
    FunSpec({
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val attachmentBucket = mockk<AttachmentBucket>(relaxed = true)
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val mockConfig = mockk<AttachmentAuthorizationConfig>(relaxed = true)
        
        every { mockConfig.getContext() } returns Attachment.Context.SUBMISSION_CODE
        justRun { mockConfig.authorizePublicDownload(any(), any()) }

        val sut =
            DownloadAttachmentService(
                attachmentRepository = attachmentRepository,
                attachmentBucket = attachmentBucket,
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                configs = listOf(mockConfig),
            )

        beforeEach {
            clearAllMocks()
        }

        context("download - with authorization") {
            test("should throw NotFoundException when contest does not exist") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.download(contestId, null, attachmentId)
                }.message shouldBe "Could not find contest with id = $contestId"
            }

            test("should throw NotFoundException when attachment does not exist") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                val contest = ContestMockBuilder.build(id = contestId)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { attachmentRepository.findEntityById(attachmentId) } returns null

                shouldThrow<NotFoundException> {
                    sut.download(contestId, null, attachmentId)
                }.message shouldBe "Could not find attachment with id = $attachmentId"
            }

            test("should download an attachment for public user") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                val contest = ContestMockBuilder.build(id = contestId)
                val attachment = AttachmentMockBuilder.build(id = attachmentId, context = Attachment.Context.SUBMISSION_CODE)
                val bytes = ByteArray(10) { it.toByte() }
                
                every { contestRepository.findEntityById(contestId) } returns contest
                every { attachmentRepository.findEntityById(attachmentId) } returns attachment
                every { attachmentBucket.download(attachment) } returns bytes

                val result = sut.download(contestId, null, attachmentId)

                result.attachment shouldBe attachment
                result.bytes shouldBe bytes
            }

            test("should download an attachment for ROOT member") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                val memberId = UuidCreator.getTimeOrderedEpoch()
                val contest = ContestMockBuilder.build(id = contestId)
                val member = MemberMockBuilder.build(id = memberId, type = Member.Type.ROOT)
                val attachment = AttachmentMockBuilder.build(id = attachmentId, context = Attachment.Context.SUBMISSION_CODE)
                val bytes = ByteArray(10) { it.toByte() }
                
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member
                every { attachmentRepository.findEntityById(attachmentId) } returns attachment
                every { attachmentBucket.download(attachment) } returns bytes

                val result = sut.download(contestId, memberId, attachmentId)

                result.attachment shouldBe attachment
                result.bytes shouldBe bytes
            }

            test("should throw ForbiddenException when no config found for context") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                val contest = ContestMockBuilder.build(id = contestId)
                val attachment = AttachmentMockBuilder.build(id = attachmentId, context = Attachment.Context.PROBLEM_DESCRIPTION)
                
                every { contestRepository.findEntityById(contestId) } returns contest
                every { attachmentRepository.findEntityById(attachmentId) } returns attachment

                shouldThrow<ForbiddenException> {
                    sut.download(contestId, null, attachmentId)
                }.message shouldBe "Cannot download attachments with context ${attachment.context}"
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
