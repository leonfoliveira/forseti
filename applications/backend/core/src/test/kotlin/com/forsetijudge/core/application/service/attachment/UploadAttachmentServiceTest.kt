package com.forsetijudge.core.application.service.attachment

import com.forsetijudge.core.application.service.attachment.auth.AttachmentAuthorizationConfig
import com.forsetijudge.core.domain.entity.Attachment
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
import io.mockk.verify

class UploadAttachmentServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val attachmentBucket = mockk<AttachmentBucket>(relaxed = true)
        val mockConfig = mockk<AttachmentAuthorizationConfig>(relaxed = true)

        every { mockConfig.getContext() } returns Attachment.Context.PROBLEM_TEST_CASES
        justRun { mockConfig.authorizeAdminUpload(any(), any()) }

        val sut =
            UploadAttachmentService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                attachmentRepository = attachmentRepository,
                attachmentBucket = attachmentBucket,
                configs = listOf(mockConfig),
            )

        beforeEach {
            clearAllMocks()
        }

        context("upload") {
            test("should upload an attachment") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                val filename = "test.txt"
                val contentType = "text/plain"
                val context = Attachment.Context.PROBLEM_TEST_CASES
                val bytes = ByteArray(10) { it.toByte() }
                every { contestRepository.findEntityById(contest.id) } returns contest
                every { memberRepository.findEntityById(member.id) } returns member
                every { attachmentRepository.save(any<Attachment>()) } answers { firstArg() }

                val attachment = sut.upload(contest.id, member.id, filename, contentType, context, bytes)

                attachment.contest shouldBe contest
                attachment.member shouldBe member
                attachment.filename shouldBe "test.txt"
                attachment.contentType shouldBe "text/plain"
                verify { attachmentRepository.save(attachment) }
                verify { attachmentBucket.upload(attachment, bytes) }
            }

            test("should throw NotFoundException when contest does not exist") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build()
                val filename = "test.txt"
                val contentType = "text/plain"
                val context = Attachment.Context.PROBLEM_TEST_CASES
                val bytes = ByteArray(10) { it.toByte() }
                every { contestRepository.findEntityById(contestId) } returns null
                every { memberRepository.findEntityById(member.id) } returns member

                shouldThrow<NotFoundException> {
                    sut.upload(contestId, member.id, filename, contentType, context, bytes)
                }.message shouldBe "Could not find contest with id = $contestId"
            }

            test("should throw NotFoundException when member does not exist") {
                val contest = ContestMockBuilder.build()
                val memberId = UuidCreator.getTimeOrderedEpoch()
                val filename = "test.txt"
                val contentType = "text/plain"
                val context = Attachment.Context.PROBLEM_TEST_CASES
                val bytes = ByteArray(10) { it.toByte() }
                every { contestRepository.findEntityById(contest.id) } returns contest
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> {
                    sut.upload(contest.id, memberId, filename, contentType, context, bytes)
                }.message shouldBe "Could not find member with id = $memberId"
            }

            test("should allow ROOT member to upload any attachment") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.ROOT)
                val filename = "test.txt"
                val contentType = "text/plain"
                val context = Attachment.Context.PROBLEM_TEST_CASES
                val bytes = ByteArray(10) { it.toByte() }
                every { contestRepository.findEntityById(contest.id) } returns contest
                every { memberRepository.findEntityById(member.id) } returns member
                every { attachmentRepository.save(any<Attachment>()) } answers { firstArg() }

                val attachment = sut.upload(contest.id, member.id, filename, contentType, context, bytes)

                attachment.contest shouldBe contest
                attachment.member shouldBe member
                verify(exactly = 0) { mockConfig.authorizeAdminUpload(any(), any()) }
            }

            test("should allow AUTOJUDGE member to upload any attachment") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.AUTOJUDGE)
                val filename = "test.txt"
                val contentType = "text/plain"
                val context = Attachment.Context.PROBLEM_TEST_CASES
                val bytes = ByteArray(10) { it.toByte() }
                every { contestRepository.findEntityById(contest.id) } returns contest
                every { memberRepository.findEntityById(member.id) } returns member
                every { attachmentRepository.save(any<Attachment>()) } answers { firstArg() }

                val attachment = sut.upload(contest.id, member.id, filename, contentType, context, bytes)

                attachment.contest shouldBe contest
                attachment.member shouldBe member
                verify(exactly = 0) { mockConfig.authorizeAdminUpload(any(), any()) }
            }

            test("should throw ForbiddenException when no config found for context") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN)
                val filename = "test.txt"
                val contentType = "text/plain"
                val context = Attachment.Context.SUBMISSION_CODE // Different context
                val bytes = ByteArray(10) { it.toByte() }
                every { contestRepository.findEntityById(contest.id) } returns contest
                every { memberRepository.findEntityById(member.id) } returns member

                shouldThrow<ForbiddenException> {
                    sut.upload(contest.id, member.id, filename, contentType, context, bytes)
                }.message shouldBe "Cannot upload attachments with context $context"
            }
        }
    })
