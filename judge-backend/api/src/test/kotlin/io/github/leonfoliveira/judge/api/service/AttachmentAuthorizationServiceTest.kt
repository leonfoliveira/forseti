package io.github.leonfoliveira.judge.api.service

import io.github.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.github.leonfoliveira.judge.api.util.ContestAuthFilter
import io.github.leonfoliveira.judge.common.domain.entity.Attachment
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import io.github.leonfoliveira.judge.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
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

        val authorizationMember =
            AuthorizationMember(
                id = memberId,
                contestId = contestId,
                type = Member.Type.CONTESTANT,
                name = "Test User",
            )

        beforeEach {
            clearAllMocks()
            mockkObject(AuthorizationContextUtil)
            every { AuthorizationContextUtil.getMember() } returns authorizationMember
        }

        context("when attachment is not found") {
            test("should throw NotFoundException") {
                every { attachmentRepository.findById(attachmentId) } returns Optional.empty()

                shouldThrow<NotFoundException> {
                    sut.authorize(contestId, attachmentId)
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
                    sut.authorize(contestId, attachmentId)
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

                    sut.authorize(contestId, attachmentId)

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

                    sut.authorize(contestId, attachmentId)

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
                    val judgeAuthMember = authorizationMember.copy(type = Member.Type.JUDGE)
                    every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)
                    every { AuthorizationContextUtil.getMember() } returns judgeAuthMember

                    sut.authorize(contestId, attachmentId)

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
                    val adminAuthMember = authorizationMember.copy(type = Member.Type.ADMIN)
                    every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)
                    every { AuthorizationContextUtil.getMember() } returns adminAuthMember

                    sut.authorize(contestId, attachmentId)

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

                    sut.authorize(contestId, attachmentId)

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
                        sut.authorize(contestId, attachmentId)
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
                    val rootAuthMember = authorizationMember.copy(type = Member.Type.ROOT)
                    every { attachmentRepository.findById(attachmentId) } returns Optional.of(attachment)
                    every { AuthorizationContextUtil.getMember() } returns rootAuthMember

                    sut.authorize(contestId, attachmentId)
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
                    every { AuthorizationContextUtil.getMember() } returns null

                    shouldThrow<ForbiddenException> {
                        sut.authorize(contestId, attachmentId)
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
                        sut.authorize(contestId, attachmentId)
                    }
                }
            }
        }
    })
