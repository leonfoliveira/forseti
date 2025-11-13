package io.github.leonfoliveira.forseti.api.service.attachment

import io.github.leonfoliveira.forseti.common.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.domain.entity.Member
import io.github.leonfoliveira.forseti.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.SessionMockBuilder
import io.github.leonfoliveira.forseti.common.repository.AttachmentRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.Optional
import java.util.UUID

class AttachmentAuthorizationServiceTest :
    FunSpec({
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val mockConfig = mockk<AttachmentAuthorizationConfig>(relaxed = true)
        every { mockConfig.getContext() } returns Attachment.Context.SUBMISSION_CODE

        val sut =
            AttachmentAuthorizationService(
                attachmentRepository = attachmentRepository,
                configs = listOf(mockConfig),
            )

        beforeEach {
            clearAllMocks()
            RequestContext.clearContext()
        }

        context("authorizeUpload") {
            test("should allow ROOT member to upload any attachment") {
                val contestId = UUID.randomUUID()
                val context = Attachment.Context.SUBMISSION_CODE
                RequestContext.getContext().session =
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(type = Member.Type.ROOT),
                    )

                sut.authorizeUpload(contestId, context)

                verify(exactly = 0) { mockConfig.authorizeAdminUpload(any(), any()) }
            }

            test("should call authorizeAdminUpload for ADMIN member") {
                val contestId = UUID.randomUUID()
                val context = Attachment.Context.SUBMISSION_CODE
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN)
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)

                sut.authorizeUpload(contestId, context)

                verify(exactly = 1) { mockConfig.authorizeAdminUpload(contestId, member) }
            }

            test("should call authorizeJudgeUpload for JUDGE member") {
                val contestId = UUID.randomUUID()
                val context = Attachment.Context.SUBMISSION_CODE
                val member = MemberMockBuilder.build(type = Member.Type.JUDGE)
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)

                sut.authorizeUpload(contestId, context)

                verify(exactly = 1) { mockConfig.authorizeJudgeUpload(contestId, member) }
            }

            test("should call authorizeContestantUpload for CONTESTANT member") {
                val contestId = UUID.randomUUID()
                val context = Attachment.Context.SUBMISSION_CODE
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)

                sut.authorizeUpload(contestId, context)

                verify(exactly = 1) { mockConfig.authorizeContestantUpload(contestId, member) }
            }

            test("should call authorizePublicUpload for AUTOJUDGE member") {
                val contestId = UUID.randomUUID()
                val context = Attachment.Context.SUBMISSION_CODE
                val member = MemberMockBuilder.build(type = Member.Type.AUTOJUDGE)
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)

                sut.authorizeUpload(contestId, context)

                verify(exactly = 1) { mockConfig.authorizePublicUpload(contestId) }
            }

            test("should throw ForbiddenException when context config not found") {
                val contestId = UUID.randomUUID()
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
                val contestId = UUID.randomUUID()
                val attachmentId = UUID.randomUUID()
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
                every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                sut.authorizeDownload(contestId, attachmentId)

                verify(exactly = 0) { mockConfig.authorizeAdminDownload(any(), any(), any()) }
            }

            test("should call authorizeAdminDownload for ADMIN member") {
                val contestId = UUID.randomUUID()
                val attachmentId = UUID.randomUUID()
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN)
                val attachment =
                    AttachmentMockBuilder.build(
                        id = attachmentId,
                        contest = ContestMockBuilder.build(id = contestId),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)
                every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                sut.authorizeDownload(contestId, attachmentId)

                verify(exactly = 1) { mockConfig.authorizeAdminDownload(contestId, member, attachment) }
            }

            test("should call authorizeJudgeDownload for JUDGE member") {
                val contestId = UUID.randomUUID()
                val attachmentId = UUID.randomUUID()
                val member = MemberMockBuilder.build(type = Member.Type.JUDGE)
                val attachment =
                    AttachmentMockBuilder.build(
                        id = attachmentId,
                        contest = ContestMockBuilder.build(id = contestId),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)
                every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                sut.authorizeDownload(contestId, attachmentId)

                verify(exactly = 1) { mockConfig.authorizeJudgeDownload(contestId, member, attachment) }
            }

            test("should call authorizeContestantDownload for CONTESTANT member") {
                val contestId = UUID.randomUUID()
                val attachmentId = UUID.randomUUID()
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val attachment =
                    AttachmentMockBuilder.build(
                        id = attachmentId,
                        contest = ContestMockBuilder.build(id = contestId),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                RequestContext.getContext().session = SessionMockBuilder.build(member = member)
                every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                sut.authorizeDownload(contestId, attachmentId)

                verify(exactly = 1) { mockConfig.authorizeContestantDownload(contestId, member, attachment) }
            }

            test("should call authorizePublicDownload when no session") {
                val contestId = UUID.randomUUID()
                val attachmentId = UUID.randomUUID()
                val attachment =
                    AttachmentMockBuilder.build(
                        id = attachmentId,
                        contest = ContestMockBuilder.build(id = contestId),
                        context = Attachment.Context.SUBMISSION_CODE,
                    )
                RequestContext.getContext().session = null
                every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                sut.authorizeDownload(contestId, attachmentId)

                verify(exactly = 1) { mockConfig.authorizePublicDownload(contestId, attachment) }
            }

            test("should throw NotFoundException when attachment not found") {
                val contestId = UUID.randomUUID()
                val attachmentId = UUID.randomUUID()
                RequestContext.getContext().session =
                    SessionMockBuilder.build(
                        member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                    )
                every { attachmentRepository.findById(attachmentId) } returns Optional.empty()

                shouldThrow<NotFoundException> {
                    sut.authorizeDownload(contestId, attachmentId)
                }
            }

            test("should throw ForbiddenException when attachment belongs to different contest") {
                val contestId = UUID.randomUUID()
                val differentContestId = UUID.randomUUID()
                val attachmentId = UUID.randomUUID()
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
                every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                shouldThrow<ForbiddenException> {
                    sut.authorizeDownload(contestId, attachmentId)
                }
            }

            test("should throw ForbiddenException when context config not found") {
                val contestId = UUID.randomUUID()
                val attachmentId = UUID.randomUUID()
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
                every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                shouldThrow<ForbiddenException> {
                    sut.authorizeDownload(contestId, attachmentId)
                }
            }
        }
    })
