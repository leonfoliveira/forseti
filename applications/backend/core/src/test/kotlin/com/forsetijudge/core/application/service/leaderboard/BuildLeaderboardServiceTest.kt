package com.forsetijudge.core.application.service.leaderboard

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkConstructor
import io.mockk.mockkStatic
import java.time.OffsetDateTime

class BuildLeaderboardServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val problemRepository = mockk<ProblemRepository>(relaxed = true)
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)

        val sut = BuildLeaderboardService(contestRepository, memberRepository, problemRepository, submissionRepository)

        val now = OffsetDateTime.now()
        val contestAuthorizer = mockk<ContestAuthorizer>(relaxed = true)

        beforeEach {
            clearAllMocks()
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
            mockkConstructor(ContestAuthorizer::class)
            every { anyConstructed<ContestAuthorizer>().checkContestStarted() } returns contestAuthorizer
            every { anyConstructed<ContestAuthorizer>().checkMemberType() } returns contestAuthorizer
        }

        context("build") {
            test("should throw NotFoundException when contest does not exist") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.build(contestId, null)
                }.message shouldBe "Could not find contest with id = $contestId"
            }

            test("should call AuthorizationUtil with correct params") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val memberId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build()
                val contest = ContestMockBuilder.build()
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member

                sut.build(contestId, memberId)
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
                                    createdAt = now.plusMinutes(1),
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
                                    createdAt = now.plusMinutes(1),
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
                                    createdAt = now.plusMinutes(1),
                                ),
                                SubmissionMockBuilder.build(
                                    problem = problem1,
                                    status = Submission.Status.JUDGED,
                                    answer = Submission.Answer.ACCEPTED,
                                    createdAt = now.plusMinutes(2),
                                ),
                                SubmissionMockBuilder.build(
                                    problem = problem1,
                                    status = Submission.Status.JUDGED,
                                    answer = Submission.Answer.WRONG_ANSWER,
                                    createdAt = now.plusMinutes(3),
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
                every { contestRepository.findEntityById(contest.id) } returns contest

                val result = sut.build(contest.id, null)

                result.contestId shouldBe contest.id
                result.slug shouldBe contest.slug
                result.startAt shouldBe contest.startAt
                result.members.size shouldBe 4

                result.members[0].id shouldBe contestantWithAccepted.id
                result.members[0].name shouldBe contestantWithAccepted.name
                result.members[0].score shouldBe 1
                result.members[0].penalty shouldBe 1
                result.members[0].problems.size shouldBe 2
                result.members[0].problems[0].id shouldBe problem1.id
                result.members[0].problems[0].letter shouldBe problem1.letter
                result.members[0].problems[0].isAccepted shouldBe true
                result.members[0].problems[0].acceptedAt shouldBe now.plusMinutes(1)
                result.members[0].problems[0].wrongSubmissions shouldBe 0
                result.members[0].problems[0].penalty shouldBe 1
                result.members[0].problems[1].id shouldBe problem2.id
                result.members[0].problems[1].letter shouldBe problem2.letter
                result.members[0].problems[1].isAccepted shouldBe false
                result.members[0].problems[1].acceptedAt shouldBe null
                result.members[0].problems[1].wrongSubmissions shouldBe 0
                result.members[0].problems[1].penalty shouldBe 0

                result.members[1].id shouldBe contestantWithWrongAnswerAndAccepted.id
                result.members[1].name shouldBe contestantWithWrongAnswerAndAccepted.name
                result.members[1].score shouldBe 1
                result.members[1].penalty shouldBe 22
                result.members[1].problems.size shouldBe 2
                result.members[1].problems[0].id shouldBe problem1.id
                result.members[1].problems[0].letter shouldBe problem1.letter
                result.members[1].problems[0].isAccepted shouldBe true
                result.members[1].problems[0].acceptedAt shouldBe now.plusMinutes(2)
                result.members[1].problems[0].wrongSubmissions shouldBe 1
                result.members[1].problems[0].penalty shouldBe 22
                result.members[1].problems[1].id shouldBe problem2.id
                result.members[1].problems[1].letter shouldBe problem2.letter
                result.members[1].problems[1].isAccepted shouldBe false
                result.members[1].problems[1].acceptedAt shouldBe null
                result.members[1].problems[1].wrongSubmissions shouldBe 0
                result.members[1].problems[1].penalty shouldBe 0

                result.members[2].id shouldBe contestantWithWrongAnswer.id
                result.members[2].name shouldBe contestantWithWrongAnswer.name
                result.members[2].score shouldBe 0
                result.members[2].penalty shouldBe 0
                result.members[2].problems.size shouldBe 2
                result.members[2].problems[0].id shouldBe problem1.id
                result.members[2].problems[0].letter shouldBe problem1.letter
                result.members[2].problems[0].isAccepted shouldBe false
                result.members[2].problems[0].acceptedAt shouldBe null
                result.members[2].problems[0].wrongSubmissions shouldBe 1
                result.members[2].problems[0].penalty shouldBe 0
                result.members[2].problems[1].id shouldBe problem2.id
                result.members[2].problems[1].letter shouldBe problem2.letter
                result.members[2].problems[1].isAccepted shouldBe false
                result.members[2].problems[1].acceptedAt shouldBe null
                result.members[2].problems[1].wrongSubmissions shouldBe 0
                result.members[2].problems[1].penalty shouldBe 0

                result.members[3].id shouldBe contestantWithNoSubmission.id
                result.members[3].name shouldBe contestantWithNoSubmission.name
                result.members[3].score shouldBe 0
                result.members[3].penalty shouldBe 0
                result.members[3].problems.size shouldBe 2
                result.members[3].problems[0].id shouldBe problem1.id
                result.members[3].problems[0].letter shouldBe problem1.letter
                result.members[3].problems[0].isAccepted shouldBe false
                result.members[3].problems[0].acceptedAt shouldBe null
                result.members[3].problems[0].wrongSubmissions shouldBe 0
                result.members[3].problems[0].penalty shouldBe 0
                result.members[3].problems[1].id shouldBe problem2.id
                result.members[3].problems[1].letter shouldBe problem2.letter
                result.members[3].problems[1].isAccepted shouldBe false
                result.members[3].problems[1].acceptedAt shouldBe null
                result.members[3].problems[1].wrongSubmissions shouldBe 0
                result.members[3].problems[1].penalty shouldBe 0
            }
        }

        context("buildPartial") {
            test("should build partial leaderboard for submission") {
                val problem = ProblemMockBuilder.build()
                val member = MemberMockBuilder.build(submissions = listOf())
                val submission =
                    SubmissionMockBuilder.build(
                        member = member,
                        problem = problem,
                        status = Submission.Status.JUDGED,
                        answer = Submission.Answer.ACCEPTED,
                        createdAt = problem.contest.startAt.plusMinutes(1),
                    )

                every { problemRepository.findEntityById(problem.id) } returns problem
                every {
                    submissionRepository.findAllByMemberIdAndProblemIdAndStatus(
                        member.id,
                        problem.id,
                        Submission.Status.JUDGED,
                    )
                } returns
                    listOf(
                        submission,
                    )

                val result = sut.buildPartial(member.id, problem.id)

                result.memberId shouldBe member.id
                result.problemId shouldBe problem.id
                result.letter shouldBe problem.letter
                result.isAccepted shouldBe true
                result.wrongSubmissions shouldBe 0
                result.penalty shouldBe 1
            }
        }
    })
