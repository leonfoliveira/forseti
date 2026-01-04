package com.forsetijudge.core.application.service.attachment

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.RequestContext
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class AuthorizeAttachmentServiceTest :
    FunSpec({
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val mockConfig = mockk<AttachmentAuthorizationConfig>(relaxed = true)
        every { mockConfig.getContext() } returns Attachment.Context.SUBMISSION_CODE

        val sut =
            AuthorizeAttachmentService(
                attachmentRepository = attachmentRepository,
                configs = listOf(mockConfig),
            )

        beforeEach {
            clearAllMocks()
            RequestContext.clearContext()
        }

        context("authorizeUpload") {
            test("should allow ROOT member to upload any attachment") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val context = Attachment.Context.SUBMISSION_CODE
                RequestContext.getContext().session =
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                    )

                sut.authorizeUpload(contestId, context)

                verify(exactly = 0) { mockConfig.authorizeAdminUpload(any(), any()) }
            }

            test("should call authorizeAdminUpload for ADMIN member") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val context = Attachment.Context.SUBMISSION_CODE
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN)
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)

                sut.authorizeUpload(contestId, context)

                verify(exactly = 1) { mockConfig.authorizeAdminUpload(contestId, member) }
            }

            test("should call authorizeJudgeUpload for JUDGE member") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val context = Attachment.Context.SUBMISSION_CODE
                val member = MemberMockBuilder.build(type = Member.Type.JUDGE)
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)

                sut.authorizeUpload(contestId, context)

                verify(exactly = 1) { mockConfig.authorizeJudgeUpload(contestId, member) }
            }

            test("should call authorizeContestantUpload for CONTESTANT member") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val context = Attachment.Context.SUBMISSION_CODE
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)

                sut.authorizeUpload(contestId, context)

                verify(exactly = 1) { mockConfig.authorizeContestantUpload(contestId, member) }
            }

            test("should call authorizePublicUpload for AUTOJUDGE member") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val context = Attachment.Context.SUBMISSION_CODE
                val member = MemberMockBuilder.build(type = Member.Type.AUTOJUDGE)
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)

                sut.authorizeUpload(contestId, context)

                verify(exactly = 1) { mockConfig.authorizePublicUpload(contestId) }
            }

            test("should throw ForbiddenException when context config not found") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val context = Attachment.Context.PROBLEM_DESCRIPTION
                RequestContext.getContext().session =
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                    )

                shouldThrow<ForbiddenException> {
                    sut.authorizeUpload(contestId, context)
                }
            }
        }

        context("authorizeDownload") {
            test("should allow ROOT member to download any attachment") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                val attachment =
                    AttachmentMockBuilder.build(
                        id = attachmentId,
                        contest = ContestMockBuilder.build(id = contestId),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                RequestContext.getContext().session =
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                    )
                every { attachmentRepository.findEntityById(attachmentId) } returns attachment

                sut.authorizeDownload(contestId, attachmentId)

                verify(exactly = 0) { mockConfig.authorizeAdminDownload(any(), any(), any()) }
            }

            test("should call authorizeAdminDownload for ADMIN member") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN)
                val attachment =
                    AttachmentMockBuilder.build(
                        id = attachmentId,
                        contest = ContestMockBuilder.build(id = contestId),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)
                every { attachmentRepository.findEntityById(attachmentId) } returns attachment

                sut.authorizeDownload(contestId, attachmentId)

                verify(exactly = 1) { mockConfig.authorizeAdminDownload(contestId, member, attachment) }
            }

            test("should call authorizeJudgeDownload for JUDGE member") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build(type = Member.Type.JUDGE)
                val attachment =
                    AttachmentMockBuilder.build(
                        id = attachmentId,
                        contest = ContestMockBuilder.build(id = contestId),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)
                every { attachmentRepository.findEntityById(attachmentId) } returns attachment

                sut.authorizeDownload(contestId, attachmentId)

                verify(exactly = 1) { mockConfig.authorizeJudgeDownload(contestId, member, attachment) }
            }

            test("should call authorizeContestantDownload for CONTESTANT member") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val attachment =
                    AttachmentMockBuilder.build(
                        id = attachmentId,
                        contest = ContestMockBuilder.build(id = contestId),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)
                every { attachmentRepository.findEntityById(attachmentId) } returns attachment

                sut.authorizeDownload(contestId, attachmentId)

                verify(exactly = 1) { mockConfig.authorizeContestantDownload(contestId, member, attachment) }
            }

            test("should call authorizePublicDownload when no session") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                val attachment =
                    AttachmentMockBuilder.build(
                        id = attachmentId,
                        contest = ContestMockBuilder.build(id = contestId),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                RequestContext.getContext().session = null
                every { attachmentRepository.findEntityById(attachmentId) } returns attachment

                sut.authorizeDownload(contestId, attachmentId)

                verify(exactly = 1) { mockConfig.authorizePublicDownload(contestId, attachment) }
            }

            test("should throw NotFoundException when attachment not found") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                RequestContext.getContext().session =
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                    )
                every { attachmentRepository.findEntityById(attachmentId) } returns null

                shouldThrow<NotFoundException> {
                    sut.authorizeDownload(contestId, attachmentId)
                }
            }

            test("should throw ForbiddenException when attachment belongs to different contest") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val differentContestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                val attachment =
                    AttachmentMockBuilder.build(
                        id = attachmentId,
                        contest = ContestMockBuilder.build(id = differentContestId),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                RequestContext.getContext().session =
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                    )
                every { attachmentRepository.findEntityById(attachmentId) } returns attachment

                shouldThrow<ForbiddenException> {
                    sut.authorizeDownload(contestId, attachmentId)
                }
            }

            test("should throw ForbiddenException when context config not found") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val attachmentId = UuidCreator.getTimeOrderedEpoch()
                val attachment =
                    AttachmentMockBuilder.build(
                        id = attachmentId,
                        contest = ContestMockBuilder.build(id = contestId),
                        context = Attachment.Context.PROBLEM_DESCRIPTION,
                    )
                RequestContext.getContext().session =
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                    )
                every { attachmentRepository.findEntityById(attachmentId) } returns attachment

                shouldThrow<ForbiddenException> {
                    sut.authorizeDownload(contestId, attachmentId)
                }
            }
        }
    })
