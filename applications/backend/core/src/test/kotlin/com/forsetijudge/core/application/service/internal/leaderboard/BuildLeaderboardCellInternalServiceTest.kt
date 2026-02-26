package com.forsetijudge.core.application.service.internal.leaderboard

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.driving.usecase.internal.leaderboard.BuildLeaderboardCellInternalUseCase
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks

class BuildLeaderboardCellInternalServiceTest :
    FunSpec({
        val sut = BuildLeaderboardCellInternalService()

        val contest = ContestMockBuilder.build()
        val problem = ProblemMockBuilder.build()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build()
        }

        test("should build leaderboard cell without submissions") {

            val command =
                BuildLeaderboardCellInternalUseCase.Command(
                    contest = contest,
                    problem = problem,
                    submissions = emptyList(),
                )

            val cell = sut.execute(command)

            cell shouldBe
                Leaderboard.Cell(
                    problemId = problem.id,
                    problemLetter = problem.letter,
                    problemColor = problem.color,
                    isAccepted = false,
                    acceptedAt = null,
                    wrongSubmissions = 0,
                    penalty = 0,
                )
        }

        test("should build leaderboard cell with accepted submission") {
            val acceptedSubmission =
                SubmissionMockBuilder.build(
                    createdAt = contest.startAt.plusMinutes(30),
                    answer = Submission.Answer.ACCEPTED,
                )

            val command =
                BuildLeaderboardCellInternalUseCase.Command(
                    contest = contest,
                    problem = problem,
                    submissions = listOf(acceptedSubmission),
                )

            val cell = sut.execute(command)

            cell shouldBe
                Leaderboard.Cell(
                    problemId = problem.id,
                    problemLetter = problem.letter,
                    problemColor = problem.color,
                    isAccepted = true,
                    acceptedAt = acceptedSubmission.createdAt,
                    wrongSubmissions = 0,
                    penalty = 30,
                )
        }

        test("should build leaderboard cell with wrong submission") {
            val wrongSubmission1 =
                SubmissionMockBuilder.build(
                    createdAt = contest.startAt.plusMinutes(10),
                    answer = Submission.Answer.WRONG_ANSWER,
                )

            val command =
                BuildLeaderboardCellInternalUseCase.Command(
                    contest = contest,
                    problem = problem,
                    submissions = listOf(wrongSubmission1),
                )

            val cell = sut.execute(command)

            cell shouldBe
                Leaderboard.Cell(
                    problemId = problem.id,
                    problemLetter = problem.letter,
                    problemColor = problem.color,
                    isAccepted = false,
                    acceptedAt = null,
                    wrongSubmissions = 1,
                    penalty = 0,
                )
        }

        test("should build leaderboard cell with wrong submissions and accepted submission") {
            val wrongSubmission1 =
                SubmissionMockBuilder.build(
                    createdAt = contest.startAt.plusMinutes(10),
                    answer = Submission.Answer.WRONG_ANSWER,
                )
            val acceptedSubmission =
                SubmissionMockBuilder.build(
                    createdAt = contest.startAt.plusMinutes(20),
                    answer = Submission.Answer.ACCEPTED,
                )
            val wrongSubmission2 =
                SubmissionMockBuilder.build(
                    createdAt = contest.startAt.plusMinutes(30),
                    answer = Submission.Answer.WRONG_ANSWER,
                )

            val command =
                BuildLeaderboardCellInternalUseCase.Command(
                    contest = contest,
                    problem = problem,
                    submissions = listOf(wrongSubmission1, acceptedSubmission, wrongSubmission2),
                )

            val cell = sut.execute(command)

            cell shouldBe
                Leaderboard.Cell(
                    problemId = problem.id,
                    problemLetter = problem.letter,
                    problemColor = problem.color,
                    isAccepted = true,
                    acceptedAt = acceptedSubmission.createdAt,
                    wrongSubmissions = 1,
                    penalty = 30 + 10,
                )
        }
    })
