package io.leonfoliveira.judge.core.service.leaderboard

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.MemberMockFactory
import io.leonfoliveira.judge.core.domain.entity.ProblemMockFactory
import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.output.LeaderboardOutputDTO
import io.leonfoliveira.judge.core.util.TimeUtils
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import java.util.Optional

class LeaderboardServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>()

    val sut =
        LeaderboardService(
            contestRepository = contestRepository,
        )

    val now = TimeUtils.now()
    beforeEach {
        mockkObject(TimeUtils)
        every { TimeUtils.now() } returns now
    }

    context("buildLeaderboard") {
        test("should throw NotFoundException when contest not found") {
            every { contestRepository.findById(1) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.buildLeaderboard(1)
            }
        }

        test("should throw ForbiddenException when contest has not started") {
            val contest = ContestMockFactory.build(startAt = now.plusDays(1))
            every { contestRepository.findById(1) }
                .returns(Optional.of(contest))

            shouldThrow<ForbiddenException> {
                sut.buildLeaderboard(1)
            }
        }

        test("should build leaderboard") {
            val acceptationTime = TimeUtils.now()
            val problemWithSubmissions = ProblemMockFactory.build(id = 1)
            val memberWithoutSubmissions = MemberMockFactory.build(id = 1, name = "Member 1")
            val memberWithWrongAnswer =
                MemberMockFactory.build(
                    id = 2,
                    name = "Member 2",
                    submissions =
                        listOf(
                            SubmissionMockFactory.build(
                                problem = problemWithSubmissions,
                                status = Submission.Status.WRONG_ANSWER,
                            ),
                        ),
                )
            val memberWithWrongAnswerAndAccepted =
                MemberMockFactory.build(
                    id = 3,
                    submissions =
                        listOf(
                            SubmissionMockFactory.build(
                                problem = problemWithSubmissions,
                                status = Submission.Status.WRONG_ANSWER,
                            ),
                            SubmissionMockFactory.build(
                                problem = problemWithSubmissions,
                                status = Submission.Status.ACCEPTED,
                                createdAt = acceptationTime,
                            ),
                        ),
                )
            val memberWithAccepted =
                MemberMockFactory.build(
                    id = 4,
                    submissions =
                        listOf(
                            SubmissionMockFactory.build(
                                problem = problemWithSubmissions,
                                status = Submission.Status.ACCEPTED,
                                createdAt = acceptationTime,
                            ),
                        ),
                )
            val problemWithoutSubmissions = ProblemMockFactory.build(id = 2)
            val contest =
                ContestMockFactory.build(
                    startAt = acceptationTime.minusMinutes(99),
                    members =
                        listOf(
                            memberWithoutSubmissions,
                            memberWithWrongAnswer,
                            memberWithWrongAnswerAndAccepted,
                            memberWithAccepted,
                        ),
                    problems =
                        listOf(
                            problemWithSubmissions,
                            problemWithoutSubmissions,
                        ),
                )
            every { contestRepository.findById(1) }
                .returns(Optional.of(contest))

            val leaderboard = sut.buildLeaderboard(1)

            leaderboard shouldBe
                LeaderboardOutputDTO(
                    contestId = 1,
                    problems =
                        listOf(
                            LeaderboardOutputDTO.ProblemDTO(
                                id = problemWithSubmissions.id,
                                title = problemWithSubmissions.title,
                            ),
                            LeaderboardOutputDTO.ProblemDTO(
                                id = problemWithoutSubmissions.id,
                                title = problemWithoutSubmissions.title,
                            ),
                        ),
                    members =
                        listOf(
                            LeaderboardOutputDTO.MemberDTO(
                                id = memberWithAccepted.id,
                                name = memberWithAccepted.name,
                                problems =
                                    listOf(
                                        LeaderboardOutputDTO.MemberDTO.MemberProblemDTO(
                                            id = problemWithSubmissions.id,
                                            wrongSubmissions = 0,
                                            isAccepted = true,
                                            penalty = 99,
                                        ),
                                        LeaderboardOutputDTO.MemberDTO.MemberProblemDTO(
                                            id = problemWithoutSubmissions.id,
                                            wrongSubmissions = 0,
                                            isAccepted = false,
                                            penalty = 0,
                                        ),
                                    ),
                                score = 1,
                                penalty = 99,
                            ),
                            LeaderboardOutputDTO.MemberDTO(
                                id = memberWithWrongAnswerAndAccepted.id,
                                name = memberWithWrongAnswerAndAccepted.name,
                                problems =
                                    listOf(
                                        LeaderboardOutputDTO.MemberDTO.MemberProblemDTO(
                                            id = problemWithSubmissions.id,
                                            wrongSubmissions = 1,
                                            isAccepted = true,
                                            penalty = 119,
                                        ),
                                        LeaderboardOutputDTO.MemberDTO.MemberProblemDTO(
                                            id = problemWithoutSubmissions.id,
                                            wrongSubmissions = 0,
                                            isAccepted = false,
                                            penalty = 0,
                                        ),
                                    ),
                                score = 1,
                                penalty = 119,
                            ),
                            LeaderboardOutputDTO.MemberDTO(
                                id = memberWithoutSubmissions.id,
                                name = memberWithoutSubmissions.name,
                                problems =
                                    listOf(
                                        LeaderboardOutputDTO.MemberDTO.MemberProblemDTO(
                                            id = problemWithSubmissions.id,
                                            wrongSubmissions = 0,
                                            isAccepted = false,
                                            penalty = 0,
                                        ),
                                        LeaderboardOutputDTO.MemberDTO.MemberProblemDTO(
                                            id = problemWithoutSubmissions.id,
                                            wrongSubmissions = 0,
                                            isAccepted = false,
                                            penalty = 0,
                                        ),
                                    ),
                                score = 0,
                                penalty = 0,
                            ),
                            LeaderboardOutputDTO.MemberDTO(
                                id = memberWithWrongAnswer.id,
                                name = memberWithWrongAnswer.name,
                                problems =
                                    listOf(
                                        LeaderboardOutputDTO.MemberDTO.MemberProblemDTO(
                                            id = problemWithSubmissions.id,
                                            wrongSubmissions = 1,
                                            isAccepted = false,
                                            penalty = 0,
                                        ),
                                        LeaderboardOutputDTO.MemberDTO.MemberProblemDTO(
                                            id = problemWithoutSubmissions.id,
                                            wrongSubmissions = 0,
                                            isAccepted = false,
                                            penalty = 0,
                                        ),
                                    ),
                                score = 0,
                                penalty = 0,
                            ),
                        ),
                )
        }
    }
})
