package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.model.AuthorizationMember
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ProblemMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.service.problem.FindProblemService
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import java.util.UUID

class ContestAuthFilterTest : FunSpec({
    val findProblemService = mockk<FindProblemService>(relaxed = true)
    val findSubmissionService = mockk<FindSubmissionService>(relaxed = true)

    val sut =
        ContestAuthFilter(
            findProblemService = findProblemService,
            findSubmissionService = findSubmissionService,
        )

    val authorizationMember =
        AuthorizationMember(
            id = UUID.randomUUID(),
            contestId = UUID.randomUUID(),
            type = Member.Type.ROOT,
            name = "Test User",
        )

    beforeEach {
        clearAllMocks()
        mockkObject(AuthorizationContextUtil)
    }

    context("check") {
        test("should throw ForbiddenException when contestId does not match") {
            val contestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns authorizationMember.copy(contestId = null)

            shouldThrow<ForbiddenException> {
                sut.check(contestId)
            }
        }

        test("should not throw ForbiddenException when contestId matches") {
            val contestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns authorizationMember.copy(contestId = contestId)

            sut.check(contestId)
        }
    }

    context("checkFromProblem") {
        test("should throw ForbiddenException when problem's contestId does not match") {
            val problemId = UUID.randomUUID()
            val problemContestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns authorizationMember.copy(contestId = null)
            every { findProblemService.findById(problemId) } returns
                ProblemMockBuilder.build(
                    contest = ContestMockBuilder.build(id = problemContestId),
                )

            shouldThrow<ForbiddenException> {
                sut.checkFromProblem(problemId)
            }
        }

        test("should not throw ForbiddenException when problem's contestId matches") {
            val problemId = UUID.randomUUID()
            val contestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns authorizationMember.copy(contestId = contestId)
            every { findProblemService.findById(problemId) } returns
                ProblemMockBuilder.build(
                    contest = ContestMockBuilder.build(id = contestId),
                )

            sut.checkFromProblem(problemId)
        }
    }

    context("checkFromSubmission") {
        test("should throw ForbiddenException when submission's contestId does not match") {
            val submissionId = UUID.randomUUID()
            val submissionContestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns authorizationMember.copy(contestId = null)
            every {
                findSubmissionService.findById(submissionId)
            } returns
                SubmissionMockBuilder.build(
                    problem =
                        ProblemMockBuilder.build(
                            contest = ContestMockBuilder.build(id = submissionContestId),
                        ),
                )

            shouldThrow<ForbiddenException> {
                sut.checkFromSubmission(submissionId)
            }
        }

        test("should not throw ForbiddenException when submission's contestId matches") {
            val submissionId = UUID.randomUUID()
            val contestId = UUID.randomUUID()
            every { AuthorizationContextUtil.getMember() } returns authorizationMember.copy(contestId = contestId)
            every {
                findSubmissionService.findById(submissionId)
            } returns
                SubmissionMockBuilder.build(
                    problem =
                        ProblemMockBuilder.build(
                            contest = ContestMockBuilder.build(id = contestId),
                        ),
                )

            sut.checkFromSubmission(submissionId)
        }
    }
})
