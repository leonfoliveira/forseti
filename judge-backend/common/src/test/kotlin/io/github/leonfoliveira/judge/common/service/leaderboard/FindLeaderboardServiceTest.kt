package io.github.leonfoliveira.judge.common.service.leaderboard

import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ProblemMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import java.time.OffsetDateTime
import java.util.Optional

class FindLeaderboardServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>(relaxed = true)

    val sut = FindLeaderboardService(contestRepository)

    val now = OffsetDateTime.now()

    beforeEach {
        clearAllMocks()
        mockkStatic(OffsetDateTime::class)
        every { OffsetDateTime.now() } returns now
    }

    context("findLeaderboardByContestId") {
        test("should throw NotFoundException when contest does not exist") {
            val contestId = java.util.UUID.randomUUID()
            every { contestRepository.findById(contestId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.findByContestId(contestId)
            }.message shouldBe "Could not find contest with id = $contestId"
        }

        test("should build leaderboard for contest") {
            val problem1 = ProblemMockBuilder.build()
            val problem2 = ProblemMockBuilder.build()

            val judge = MemberMockBuilder.build(type = Member.Type.JUDGE)
            val contestantWithNoSubmission =
                MemberMockBuilder.build(
                    name = "Z",
                    type = Member.Type.CONTESTANT,
                    submissions =
                        listOf(
                            SubmissionMockBuilder.build(problem = problem1, status = Submission.Status.FAILED),
                            SubmissionMockBuilder.build(problem = problem1, status = Submission.Status.JUDGING),
                        ),
                )
            val contestantWithWrongAnswer =
                MemberMockBuilder.build(
                    type = Member.Type.CONTESTANT,
                    submissions =
                        listOf(
                            SubmissionMockBuilder.build(
                                problem = problem1,
                                status = Submission.Status.JUDGED,
                                answer = Submission.Answer.WRONG_ANSWER,
                                createdAt = now.plusSeconds(1),
                            ),
                        ),
                )
            val contestantWithAccepted =
                MemberMockBuilder.build(
                    type = Member.Type.CONTESTANT,
                    submissions =
                        listOf(
                            SubmissionMockBuilder.build(
                                problem = problem1,
                                status = Submission.Status.JUDGED,
                                answer = Submission.Answer.ACCEPTED,
                                createdAt = now.plusSeconds(1),
                            ),
                        ),
                )
            val contestantWithWrongAnswerAndAccepted =
                MemberMockBuilder.build(
                    name = "A",
                    type = Member.Type.CONTESTANT,
                    submissions =
                        listOf(
                            SubmissionMockBuilder.build(
                                problem = problem1,
                                status = Submission.Status.JUDGED,
                                answer = Submission.Answer.WRONG_ANSWER,
                                createdAt = now.plusSeconds(1),
                            ),
                            SubmissionMockBuilder.build(
                                problem = problem1,
                                status = Submission.Status.JUDGED,
                                answer = Submission.Answer.ACCEPTED,
                                createdAt = now.plusSeconds(2),
                            ),
                            SubmissionMockBuilder.build(
                                problem = problem1,
                                status = Submission.Status.JUDGED,
                                answer = Submission.Answer.WRONG_ANSWER,
                                createdAt = now.plusSeconds(3),
                            ),
                        ),
                )

            val contest =
                ContestMockBuilder.build(
                    startAt = now,
                    problems = listOf(problem1, problem2),
                    members =
                        listOf(
                            judge,
                            contestantWithNoSubmission,
                            contestantWithWrongAnswer,
                            contestantWithAccepted,
                            contestantWithWrongAnswerAndAccepted,
                        ),
                )
            every { contestRepository.findById(contest.id) } returns Optional.of(contest)

            val result = sut.findByContestId(contest.id)

            result.contestId shouldBe contest.id
            result.slug shouldBe contest.slug
            result.startAt shouldBe contest.startAt
            result.classification.size shouldBe 4

            result.classification[0].memberId shouldBe contestantWithAccepted.id
            result.classification[0].name shouldBe contestantWithAccepted.name
            result.classification[0].score shouldBe 1
            result.classification[0].penalty shouldBe 1
            result.classification[0].problems.size shouldBe 2
            result.classification[0].problems[0].problemId shouldBe problem1.id
            result.classification[0].problems[0].letter shouldBe problem1.letter
            result.classification[0].problems[0].isAccepted shouldBe true
            result.classification[0].problems[0].acceptedAt shouldBe now.plusSeconds(1)
            result.classification[0].problems[0].wrongSubmissions shouldBe 0
            result.classification[0].problems[0].penalty shouldBe 1
            result.classification[0].problems[1].problemId shouldBe problem2.id
            result.classification[0].problems[1].letter shouldBe problem2.letter
            result.classification[0].problems[1].isAccepted shouldBe false
            result.classification[0].problems[1].acceptedAt shouldBe null
            result.classification[0].problems[1].wrongSubmissions shouldBe 0
            result.classification[0].problems[1].penalty shouldBe 0

            result.classification[1].memberId shouldBe contestantWithWrongAnswerAndAccepted.id
            result.classification[1].name shouldBe contestantWithWrongAnswerAndAccepted.name
            result.classification[1].score shouldBe 1
            result.classification[1].penalty shouldBe 1202
            result.classification[1].problems.size shouldBe 2
            result.classification[1].problems[0].problemId shouldBe problem1.id
            result.classification[1].problems[0].letter shouldBe problem1.letter
            result.classification[1].problems[0].isAccepted shouldBe true
            result.classification[1].problems[0].acceptedAt shouldBe now.plusSeconds(2)
            result.classification[1].problems[0].wrongSubmissions shouldBe 1
            result.classification[1].problems[0].penalty shouldBe 1202
            result.classification[1].problems[1].problemId shouldBe problem2.id
            result.classification[1].problems[1].letter shouldBe problem2.letter
            result.classification[1].problems[1].isAccepted shouldBe false
            result.classification[1].problems[1].acceptedAt shouldBe null
            result.classification[1].problems[1].wrongSubmissions shouldBe 0
            result.classification[1].problems[1].penalty shouldBe 0

            result.classification[2].memberId shouldBe contestantWithWrongAnswer.id
            result.classification[2].name shouldBe contestantWithWrongAnswer.name
            result.classification[2].score shouldBe 0
            result.classification[2].penalty shouldBe 0
            result.classification[2].problems.size shouldBe 2
            result.classification[2].problems[0].problemId shouldBe problem1.id
            result.classification[2].problems[0].letter shouldBe problem1.letter
            result.classification[2].problems[0].isAccepted shouldBe false
            result.classification[2].problems[0].acceptedAt shouldBe null
            result.classification[2].problems[0].wrongSubmissions shouldBe 1
            result.classification[2].problems[0].penalty shouldBe 0
            result.classification[2].problems[1].problemId shouldBe problem2.id
            result.classification[2].problems[1].letter shouldBe problem2.letter
            result.classification[2].problems[1].isAccepted shouldBe false
            result.classification[2].problems[1].acceptedAt shouldBe null
            result.classification[2].problems[1].wrongSubmissions shouldBe 0
            result.classification[2].problems[1].penalty shouldBe 0

            result.classification[3].memberId shouldBe contestantWithNoSubmission.id
            result.classification[3].name shouldBe contestantWithNoSubmission.name
            result.classification[3].score shouldBe 0
            result.classification[3].penalty shouldBe 0
            result.classification[3].problems.size shouldBe 2
            result.classification[3].problems[0].problemId shouldBe problem1.id
            result.classification[3].problems[0].letter shouldBe problem1.letter
            result.classification[3].problems[0].isAccepted shouldBe false
            result.classification[3].problems[0].acceptedAt shouldBe null
            result.classification[3].problems[0].wrongSubmissions shouldBe 0
            result.classification[3].problems[0].penalty shouldBe 0
            result.classification[3].problems[1].problemId shouldBe problem2.id
            result.classification[3].problems[1].letter shouldBe problem2.letter
            result.classification[3].problems[1].isAccepted shouldBe false
            result.classification[3].problems[1].acceptedAt shouldBe null
            result.classification[3].problems[1].wrongSubmissions shouldBe 0
            result.classification[3].problems[1].penalty shouldBe 0
        }
    }
})
