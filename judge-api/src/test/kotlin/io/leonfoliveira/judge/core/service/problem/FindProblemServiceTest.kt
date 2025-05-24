package io.leonfoliveira.judge.core.service.problem

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.MemberMockFactory
import io.leonfoliveira.judge.core.domain.entity.ProblemMockFactory
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.model.DownloadAttachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.leonfoliveira.judge.core.service.dto.output.ProblemMemberOutputDTO
import io.leonfoliveira.judge.core.service.dto.output.toOutputDTO
import io.leonfoliveira.judge.core.util.TimeUtils
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import java.time.LocalDateTime
import java.util.Optional

class FindProblemServiceTest : FunSpec({
    val problemRepository = mockk<ProblemRepository>()
    val contestRepository = mockk<ContestRepository>()
    val bucketAdapter = mockk<BucketAdapter>()

    val sut =
        FindProblemService(
            problemRepository = problemRepository,
            contestRepository = contestRepository,
            bucketAdapter = bucketAdapter,
        )

    val now = LocalDateTime.now()

    every { bucketAdapter.createDownloadAttachment(any()) }
        .returns(DownloadAttachment("url", "key"))

    beforeEach {
        mockkObject(TimeUtils)
        every { TimeUtils.now() } returns now
    }

    context("findById") {
        test("should throw ForbiddenException when contest not started") {
            val problem =
                ProblemMockFactory.build(
                    contest =
                        ContestMockFactory.build(
                            startAt = now.plusDays(1),
                        ),
                )
            every { problemRepository.findById(1) }
                .returns(Optional.of(problem))

            shouldThrow<ForbiddenException> {
                sut.findById(1)
            }
        }

        test("should return problem when found") {
            val problem =
                ProblemMockFactory.build(
                    contest =
                        ContestMockFactory.build(
                            startAt = now.minusDays(1),
                        ),
                )
            every { problemRepository.findById(1) }
                .returns(Optional.of(problem))

            val result = sut.findById(1)

            result shouldBe problem.toOutputDTO(bucketAdapter)
        }
    }

    context("findAllByContest") {
        test("should throw ForbiddenException when contest not started") {
            val contest =
                ContestMockFactory.build(
                    startAt = now.plusDays(1),
                )
            every { contestRepository.findById(1) }
                .returns(Optional.of(contest))

            shouldThrow<ForbiddenException> {
                sut.findAllByContest(1)
            }
        }

        test("should return problems when found") {
            val contest =
                ContestMockFactory.build(
                    startAt = now.minusDays(1),
                    problems = listOf(ProblemMockFactory.build()),
                )
            every { contestRepository.findById(1) }
                .returns(Optional.of(contest))

            val result = sut.findAllByContest(1)

            result shouldBe contest.problems
        }
    }

    context("findAllByContestForMember") {
        test("should throw ForbiddenException when contest not started") {
            val contest =
                ContestMockFactory.build(
                    startAt = now.plusDays(1),
                )
            every { contestRepository.findById(1) }
                .returns(Optional.of(contest))

            shouldThrow<ForbiddenException> {
                sut.findAllByContestForMember(1, 1)
            }
        }

        test("should return problems when found") {
            val contest =
                ContestMockFactory.build(
                    startAt = now.minusDays(1),
                    problems =
                        listOf(
                            ProblemMockFactory.build(
                                submissions =
                                    listOf(
                                        SubmissionMockFactory.build(
                                            member = MemberMockFactory.build(id = 1),
                                            status = Submission.Status.JUDGING,
                                        ),
                                        SubmissionMockFactory.build(
                                            member = MemberMockFactory.build(id = 1),
                                            status = Submission.Status.WRONG_ANSWER,
                                        ),
                                        SubmissionMockFactory.build(
                                            member = MemberMockFactory.build(id = 1),
                                            status = Submission.Status.WRONG_ANSWER,
                                        ),
                                        SubmissionMockFactory.build(
                                            member = MemberMockFactory.build(id = 1),
                                            status = Submission.Status.ACCEPTED,
                                        ),
                                        SubmissionMockFactory.build(
                                            member = MemberMockFactory.build(id = 2),
                                            status = Submission.Status.ACCEPTED,
                                        ),
                                    ),
                            ),
                        ),
                )
            every { contestRepository.findById(1) }
                .returns(Optional.of(contest))

            val result = sut.findAllByContestForMember(1, 1)

            result shouldBe
                listOf(
                    ProblemMemberOutputDTO(
                        id = contest.problems[0].id,
                        title = contest.problems[0].title,
                        description = contest.problems[0].description,
                        isAccepted = true,
                        wrongSubmissions = 2,
                    ),
                )
        }
    }
})
