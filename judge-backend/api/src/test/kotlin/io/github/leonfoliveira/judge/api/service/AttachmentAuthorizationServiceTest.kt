package io.github.leonfoliveira.judge.api.service

import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.domain.entity.Attachment
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.domain.model.RequestContext
import io.github.leonfoliveira.judge.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SessionMockBuilder
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
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
        val contestAuthFilter = mockk<ContestAuthFilter>(relaxed = true)

        val sut =
            AttachmentAuthorizationService(
                attachmentRepository = attachmentRepository,
                contestAuthFilter = contestAuthFilter,
            )

        val contestId = UUID.randomUUID()
        val attachmentId = UUID.randomUUID()
        val memberId = UUID.randomUUID()
        val otherMemberId = UUID.randomUUID()

        val contest = ContestMockBuilder.build(id = contestId)
        val member = MemberMockBuilder.build(id = memberId, type = Member.Type.CONTESTANT)
        val otherMember = MemberMockBuilder.build(id = otherMemberId, type = Member.Type.CONTESTANT)

        beforeEach {
            clearAllMocks()
            RequestContext.getContext().session = SessionMockBuilder.build(member = member)
        }

        context("authorizeUpload") {
            context("when member is ROOT") {
                test("should authorize upload for any context") {
                    RequestContext.getContext().session =
                        SessionMockBuilder.build(
                            member = MemberMockBuilder.build(type = Member.Type.ROOT),
                        )

                    sut.authorizeUpload(contestId, Attachment.Context.PROBLEM_DESCRIPTION)
                    sut.authorizeUpload(contestId, Attachment.Context.PROBLEM_TEST_CASES)
                    sut.authorizeUpload(contestId, Attachment.Context.SUBMISSION_CODE)

                    verify(exactly = 3) { contestAuthFilter.checkIfStarted(contestId) }
                }
            }

            context("PROBLEM_DESCRIPTION context") {
                test("should authorize JUDGE member successfully") {
                    RequestContext.getContext().session =
                        SessionMockBuilder.build(
                            member = MemberMockBuilder.build(type = Member.Type.JUDGE),
                        )

                    sut.authorizeUpload(contestId, Attachment.Context.PROBLEM_DESCRIPTION)

                    verify { contestAuthFilter.checkIfStarted(contestId) }
                    verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
                }

                test("should authorize ADMIN member successfully") {
                    RequestContext.getContext().session =
                        SessionMockBuilder.build(
                            member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                        )

                    sut.authorizeUpload(contestId, Attachment.Context.PROBLEM_DESCRIPTION)

                    verify { contestAuthFilter.checkIfStarted(contestId) }
                    verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
                }

                test("should throw ForbiddenException for CONTESTANT member") {
                    shouldThrow<ForbiddenException> {
                        sut.authorizeUpload(contestId, Attachment.Context.PROBLEM_DESCRIPTION)
                    }

                    verify { contestAuthFilter.checkIfStarted(contestId) }
                }
            }

            context("PROBLEM_TEST_CASES context") {
                test("should authorize JUDGE member successfully") {
                    RequestContext.getContext().session =
                        SessionMockBuilder.build(
                            member = MemberMockBuilder.build(type = Member.Type.JUDGE),
                        )

                    sut.authorizeUpload(contestId, Attachment.Context.PROBLEM_TEST_CASES)

                    verify { contestAuthFilter.checkIfStarted(contestId) }
                    verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
                }

                test("should authorize ADMIN member successfully") {
                    RequestContext.getContext().session =
                        SessionMockBuilder.build(
                            member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                        )

                    sut.authorizeUpload(contestId, Attachment.Context.PROBLEM_TEST_CASES)

                    verify { contestAuthFilter.checkIfStarted(contestId) }
                    verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
                }

                test("should throw ForbiddenException for CONTESTANT member") {
                    shouldThrow<ForbiddenException> {
                        sut.authorizeUpload(contestId, Attachment.Context.PROBLEM_TEST_CASES)
                    }

                    verify { contestAuthFilter.checkIfStarted(contestId) }
                }
            }

            context("SUBMISSION_CODE context") {
                test("should authorize CONTESTANT member successfully") {
                    sut.authorizeUpload(contestId, Attachment.Context.SUBMISSION_CODE)

                    verify { contestAuthFilter.checkIfStarted(contestId) }
                    verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
                }

                test("should throw ForbiddenException for JUDGE member") {
                    RequestContext.getContext().session =
                        SessionMockBuilder.build(
                            member = MemberMockBuilder.build(type = Member.Type.JUDGE),
                        )

                    shouldThrow<ForbiddenException> {
                        sut.authorizeUpload(contestId, Attachment.Context.SUBMISSION_CODE)
                    }

                    verify { contestAuthFilter.checkIfStarted(contestId) }
                }

                test("should throw ForbiddenException for ADMIN member") {
                    RequestContext.getContext().session =
                        SessionMockBuilder.build(
                            member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                        )

                    shouldThrow<ForbiddenException> {
                        sut.authorizeUpload(contestId, Attachment.Context.SUBMISSION_CODE)
                    }

                    verify { contestAuthFilter.checkIfStarted(contestId) }
                }
            }

            context("unsupported context") {
                test("should throw ForbiddenException for EXECUTION_OUTPUT context") {
                    shouldThrow<ForbiddenException> {
                        sut.authorizeUpload(contestId, Attachment.Context.EXECUTION_OUTPUT)
                    }

                    verify { contestAuthFilter.checkIfStarted(contestId) }
                }
            }
        }

        context("authorizeDownload") {
            context("when attachment is not found") {
                test("should throw NotFoundException") {
                    every { attachmentRepository.findById(attachmentId) } returns Optional.empty()

                    shouldThrow<NotFoundException> {
                        sut.authorizeDownload(contestId, attachmentId)
                    }
                }
            }

            context("when attachment does not belong to contest") {
                test("should throw ForbiddenException") {
                    val otherContestId = UUID.randomUUID()
                    val attachment =
                        AttachmentMockBuilder.build(
                            id = attachmentId,
                            contest = ContestMockBuilder.build(id = otherContestId),
                        )
                    every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                    shouldThrow<ForbiddenException> {
                        sut.authorizeDownload(contestId, attachmentId)
                    }
                }
            }

            context("when attachment belongs to contest") {
                context("PROBLEM_DESCRIPTION context") {
                    test("should authorize successfully") {
                        val attachment =
                            AttachmentMockBuilder.build(
                                id = attachmentId,
                                contest = contest,
                                context = Attachment.Context.PROBLEM_DESCRIPTION,
                            )
                        every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                        sut.authorizeDownload(contestId, attachmentId)

                        verify { contestAuthFilter.checkIfStarted(contestId) }
                    }
                }

                context("PROBLEM_TEST_CASES context") {
                    test("should authorize successfully") {
                        val attachment =
                            AttachmentMockBuilder.build(
                                id = attachmentId,
                                contest = contest,
                                context = Attachment.Context.PROBLEM_TEST_CASES,
                            )
                        every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                        sut.authorizeDownload(contestId, attachmentId)

                        verify { contestAuthFilter.checkIfStarted(contestId) }
                    }
                }

                context("SUBMISSION_CODE context") {
                    test("should authorize JUDGE member successfully") {
                        val attachment =
                            AttachmentMockBuilder.build(
                                id = attachmentId,
                                contest = contest,
                                member = member,
                                context = Attachment.Context.SUBMISSION_CODE,
                            )
                        every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)
                        RequestContext.getContext().session =
                            SessionMockBuilder.build(
                                member = MemberMockBuilder.build(type = Member.Type.JUDGE),
                            )

                        sut.authorizeDownload(contestId, attachmentId)

                        verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
                        verify { contestAuthFilter.checkIfStarted(contestId) }
                    }

                    test("should authorize ADMIN member successfully") {
                        val attachment =
                            AttachmentMockBuilder.build(
                                id = attachmentId,
                                contest = contest,
                                member = member,
                                context = Attachment.Context.SUBMISSION_CODE,
                            )
                        every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)
                        RequestContext.getContext().session =
                            SessionMockBuilder.build(
                                member = MemberMockBuilder.build(type = Member.Type.ADMIN),
                            )

                        sut.authorizeDownload(contestId, attachmentId)

                        verify { contestAuthFilter.checkIfMemberBelongsToContest(contestId) }
                        verify { contestAuthFilter.checkIfStarted(contestId) }
                    }

                    test("should authorize CONTESTANT member for their own submission") {
                        val attachment =
                            AttachmentMockBuilder.build(
                                id = attachmentId,
                                contest = contest,
                                member = member,
                                context = Attachment.Context.SUBMISSION_CODE,
                            )
                        every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                        sut.authorizeDownload(contestId, attachmentId)

                        verify { contestAuthFilter.checkIfStarted(contestId) }
                    }

                    test("should throw ForbiddenException when CONTESTANT tries to read other member's submission") {
                        val attachment =
                            AttachmentMockBuilder.build(
                                id = attachmentId,
                                contest = contest,
                                member = otherMember,
                                context = Attachment.Context.SUBMISSION_CODE,
                            )
                        every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                        shouldThrow<ForbiddenException> {
                            sut.authorizeDownload(contestId, attachmentId)
                        }

                        verify { contestAuthFilter.checkIfStarted(contestId) }
                    }

                    test("should authorize ROOT member successfully") {
                        val attachment =
                            AttachmentMockBuilder.build(
                                id = attachmentId,
                                contest = contest,
                                member = member,
                                context = Attachment.Context.SUBMISSION_CODE,
                            )
                        every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)
                        RequestContext.getContext().session =
                            SessionMockBuilder.build(
                                member = MemberMockBuilder.build(type = Member.Type.ROOT),
                            )

                        sut.authorizeDownload(contestId, attachmentId)
                    }

                    test("should throw ForbiddenException when member is null") {
                        val attachment =
                            AttachmentMockBuilder.build(
                                id = attachmentId,
                                contest = contest,
                                member = member,
                                context = Attachment.Context.SUBMISSION_CODE,
                            )
                        every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)
                        RequestContext.getContext().session = null

                        shouldThrow<ForbiddenException> {
                            sut.authorizeDownload(contestId, attachmentId)
                        }

                        verify { contestAuthFilter.checkIfStarted(contestId) }
                    }
                }

                context("EXECUTION_OUTPUT context") {
                    test("should throw ForbiddenException") {
                        val attachment =
                            AttachmentMockBuilder.build(
                                id = attachmentId,
                                contest = contest,
                                context = Attachment.Context.EXECUTION_OUTPUT,
                            )
                        every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)

                        shouldThrow<ForbiddenException> {
                            sut.authorizeDownload(contestId, attachmentId)
                        }
                    }
                }
            }
        }
    })
