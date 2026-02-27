package com.forsetijudge.core.application.service.external.leaderboard

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.entity.freeze
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.driven.cache.LeaderboardCacheStore
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.internal.leaderboard.BuildLeaderboardCellInternalUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime

class BuildLeaderboardExternalServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val frozenSubmissionRepository = mockk<FrozenSubmissionRepository>(relaxed = true)
        val buildLeaderboardCellInternalUseCase = mockk<BuildLeaderboardCellInternalUseCase>(relaxed = true)
        val leaderboardCacheStore = mockk<LeaderboardCacheStore>(relaxed = true)

        val sut =
            BuildLeaderboardService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                submissionRepository = submissionRepository,
                frozenSubmissionRepository = frozenSubmissionRepository,
                buildLeaderboardCellInternalUseCase = buildLeaderboardCellInternalUseCase,
                leaderboardCacheStore = leaderboardCacheStore,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        test("should throw NotFoundException when contest does not exist") {
            every { contestRepository.findById(contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute() }
        }

        test("should throw NotFoundException when member does not exist") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute() }
        }

        test("should throw ForbiddenException when member cannot access not started contest") {
            val contest =
                ContestMockBuilder.build(
                    startAt = OffsetDateTime.now().plusHours(1),
                )
            val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

            shouldThrow<ForbiddenException> { sut.execute() }
        }

        test("should build leaderboard cells successfully") {
            val problemA = ProblemMockBuilder.build()
            val problemB = ProblemMockBuilder.build()

            val contest = ContestMockBuilder.build(id = contextContestId, problems = listOf(problemA, problemB))
            val member = MemberMockBuilder.build(type = Member.Type.ADMIN)
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

            val memberWithNoSubmission = MemberMockBuilder.build(type = Member.Type.CONTESTANT, name = "second")
            val memberWithWrongSubmission = MemberMockBuilder.build(type = Member.Type.CONTESTANT, name = "first")
            val memberWithAcceptedSubmission = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
            val memberWithWrongAndAcceptedSubmission = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
            val memberWithDoubleAcceptedSubmission = MemberMockBuilder.build(type = Member.Type.CONTESTANT)

            every { memberRepository.findAllByContestIdAndType(contextContestId, Member.Type.CONTESTANT) } returns
                listOf(
                    memberWithNoSubmission,
                    memberWithWrongSubmission,
                    memberWithAcceptedSubmission,
                    memberWithWrongAndAcceptedSubmission,
                    memberWithDoubleAcceptedSubmission,
                )

            every { buildLeaderboardCellInternalUseCase.execute(any()) } returnsMany
                listOf(
                    // memberWithNoSubmission
                    Leaderboard.Cell(
                        memberId = memberWithNoSubmission.id,
                        problemId = problemA.id,
                        problemLetter = problemA.letter,
                        problemColor = problemA.color,
                        isAccepted = false,
                        acceptedAt = null,
                        wrongSubmissions = 0,
                        penalty = 0,
                    ),
                    Leaderboard.Cell(
                        memberId = memberWithNoSubmission.id,
                        problemId = problemB.id,
                        problemLetter = problemB.letter,
                        problemColor = problemB.color,
                        isAccepted = false,
                        acceptedAt = null,
                        wrongSubmissions = 0,
                        penalty = 0,
                    ),
                    // memberWithWrongSubmission
                    Leaderboard.Cell(
                        memberId = memberWithWrongSubmission.id,
                        problemId = problemA.id,
                        problemLetter = problemA.letter,
                        problemColor = problemA.color,
                        isAccepted = false,
                        acceptedAt = null,
                        wrongSubmissions = 1,
                        penalty = 0,
                    ),
                    Leaderboard.Cell(
                        memberId = memberWithWrongSubmission.id,
                        problemId = problemB.id,
                        problemLetter = problemB.letter,
                        problemColor = problemB.color,
                        isAccepted = false,
                        acceptedAt = null,
                        wrongSubmissions = 0,
                        penalty = 0,
                    ),
                    // memberWithAcceptedSubmission
                    Leaderboard.Cell(
                        memberId = memberWithAcceptedSubmission.id,
                        problemId = problemA.id,
                        problemLetter = problemA.letter,
                        problemColor = problemA.color,
                        isAccepted = true,
                        acceptedAt = ExecutionContext.Companion.get().startedAt,
                        wrongSubmissions = 0,
                        penalty = 0,
                    ),
                    Leaderboard.Cell(
                        memberId = memberWithAcceptedSubmission.id,
                        problemId = problemB.id,
                        problemLetter = problemB.letter,
                        problemColor = problemB.color,
                        isAccepted = false,
                        acceptedAt = null,
                        wrongSubmissions = 0,
                        penalty = 0,
                    ),
                    // memberWithWrongAndAcceptedSubmission
                    Leaderboard.Cell(
                        memberId = memberWithWrongAndAcceptedSubmission.id,
                        problemId = problemA.id,
                        problemLetter = problemA.letter,
                        problemColor = problemA.color,
                        isAccepted = true,
                        acceptedAt = ExecutionContext.Companion.get().startedAt,
                        wrongSubmissions = 1,
                        penalty = 10,
                    ),
                    Leaderboard.Cell(
                        memberId = memberWithWrongAndAcceptedSubmission.id,
                        problemId = problemB.id,
                        problemLetter = problemB.letter,
                        problemColor = problemB.color,
                        isAccepted = false,
                        acceptedAt = null,
                        wrongSubmissions = 0,
                        penalty = 0,
                    ),
                )

            every { leaderboardCacheStore.getAllCellsByContestId(contest.id) } returns
                listOf(
                    // memberWithDoubleAcceptedSubmission
                    Leaderboard.Cell(
                        memberId = memberWithDoubleAcceptedSubmission.id,
                        problemId = problemA.id,
                        problemLetter = problemA.letter,
                        problemColor = problemA.color,
                        isAccepted = true,
                        acceptedAt = ExecutionContext.Companion.get().startedAt,
                        wrongSubmissions = 1,
                        penalty = 10,
                    ),
                    Leaderboard.Cell(
                        memberId = memberWithDoubleAcceptedSubmission.id,
                        problemId = problemB.id,
                        problemLetter = problemB.letter,
                        problemColor = problemB.color,
                        isAccepted = true,
                        acceptedAt = ExecutionContext.Companion.get().startedAt,
                        wrongSubmissions = 1,
                        penalty = 10,
                    ),
                )

            val result = sut.execute()

            result shouldBe
                Leaderboard(
                    contestId = contextContestId,
                    contestStartAt = contest.startAt,
                    isFrozen = contest.isFrozen,
                    issuedAt = ExecutionContext.Companion.get().startedAt,
                    rows =
                        listOf(
                            Leaderboard.Row(
                                memberId = memberWithDoubleAcceptedSubmission.id,
                                memberName = memberWithDoubleAcceptedSubmission.name,
                                score = 2,
                                penalty = 20,
                                cells =
                                    listOf(
                                        Leaderboard.Cell(
                                            memberId = memberWithDoubleAcceptedSubmission.id,
                                            problemId = problemA.id,
                                            problemLetter = problemA.letter,
                                            problemColor = problemA.color,
                                            isAccepted = true,
                                            acceptedAt = ExecutionContext.Companion.get().startedAt,
                                            wrongSubmissions = 1,
                                            penalty = 10,
                                        ),
                                        Leaderboard.Cell(
                                            memberId = memberWithDoubleAcceptedSubmission.id,
                                            problemId = problemB.id,
                                            problemLetter = problemB.letter,
                                            problemColor = problemB.color,
                                            isAccepted = true,
                                            acceptedAt = ExecutionContext.Companion.get().startedAt,
                                            wrongSubmissions = 1,
                                            penalty = 10,
                                        ),
                                    ),
                            ),
                            Leaderboard.Row(
                                memberId = memberWithAcceptedSubmission.id,
                                memberName = memberWithAcceptedSubmission.name,
                                score = 1,
                                penalty = 0,
                                cells =
                                    listOf(
                                        Leaderboard.Cell(
                                            memberId = memberWithAcceptedSubmission.id,
                                            problemId = problemA.id,
                                            problemLetter = problemA.letter,
                                            problemColor = problemA.color,
                                            isAccepted = true,
                                            acceptedAt = ExecutionContext.Companion.get().startedAt,
                                            wrongSubmissions = 0,
                                            penalty = 0,
                                        ),
                                        Leaderboard.Cell(
                                            memberId = memberWithAcceptedSubmission.id,
                                            problemId = problemB.id,
                                            problemLetter = problemB.letter,
                                            problemColor = problemB.color,
                                            isAccepted = false,
                                            acceptedAt = null,
                                            wrongSubmissions = 0,
                                            penalty = 0,
                                        ),
                                    ),
                            ),
                            Leaderboard.Row(
                                memberId = memberWithWrongAndAcceptedSubmission.id,
                                memberName = memberWithWrongAndAcceptedSubmission.name,
                                score = 1,
                                penalty = 10,
                                cells =
                                    listOf(
                                        Leaderboard.Cell(
                                            memberId = memberWithWrongAndAcceptedSubmission.id,
                                            problemId = problemA.id,
                                            problemLetter = problemA.letter,
                                            problemColor = problemA.color,
                                            isAccepted = true,
                                            acceptedAt = ExecutionContext.Companion.get().startedAt,
                                            wrongSubmissions = 1,
                                            penalty = 10,
                                        ),
                                        Leaderboard.Cell(
                                            memberId = memberWithWrongAndAcceptedSubmission.id,
                                            problemId = problemB.id,
                                            problemLetter = problemB.letter,
                                            problemColor = problemB.color,
                                            isAccepted = false,
                                            acceptedAt = null,
                                            wrongSubmissions = 0,
                                            penalty = 0,
                                        ),
                                    ),
                            ),
                            Leaderboard.Row(
                                memberId = memberWithWrongSubmission.id,
                                memberName = memberWithWrongSubmission.name,
                                score = 0,
                                penalty = 0,
                                cells =
                                    listOf(
                                        Leaderboard.Cell(
                                            memberId = memberWithWrongSubmission.id,
                                            problemId = problemA.id,
                                            problemLetter = problemA.letter,
                                            problemColor = problemA.color,
                                            isAccepted = false,
                                            acceptedAt = null,
                                            wrongSubmissions = 1,
                                            penalty = 0,
                                        ),
                                        Leaderboard.Cell(
                                            memberId = memberWithWrongSubmission.id,
                                            problemId = problemB.id,
                                            problemLetter = problemB.letter,
                                            problemColor = problemB.color,
                                            isAccepted = false,
                                            acceptedAt = null,
                                            wrongSubmissions = 0,
                                            penalty = 0,
                                        ),
                                    ),
                            ),
                            Leaderboard.Row(
                                memberId = memberWithNoSubmission.id,
                                memberName = memberWithNoSubmission.name,
                                score = 0,
                                penalty = 0,
                                cells =
                                    listOf(
                                        Leaderboard.Cell(
                                            memberId = memberWithNoSubmission.id,
                                            problemId = problemA.id,
                                            problemLetter = problemA.letter,
                                            problemColor = problemA.color,
                                            isAccepted = false,
                                            acceptedAt = null,
                                            wrongSubmissions = 0,
                                            penalty = 0,
                                        ),
                                        Leaderboard.Cell(
                                            memberId = memberWithNoSubmission.id,
                                            problemId = problemB.id,
                                            problemLetter = problemB.letter,
                                            problemColor = problemB.color,
                                            isAccepted = false,
                                            acceptedAt = null,
                                            wrongSubmissions = 0,
                                            penalty = 0,
                                        ),
                                    ),
                            ),
                        ),
                )
        }

        test("should build leaderboard with frozen contest") {
            val problem = ProblemMockBuilder.build()
            val submission =
                SubmissionMockBuilder.build(
                    problem = problem,
                    status = Submission.Status.JUDGED,
                    answer = Submission.Answer.ACCEPTED,
                )
            val frozenSubmission =
                SubmissionMockBuilder
                    .build(
                        problem = problem,
                        status = Submission.Status.JUDGING,
                        answer = null,
                    ).freeze()
            val member =
                MemberMockBuilder.build(
                    type = Member.Type.CONTESTANT,
                    submissions = listOf(submission),
                    frozenSubmissions = listOf(frozenSubmission),
                )
            val contest =
                ContestMockBuilder.build(
                    id = contextContestId,
                    startAt = OffsetDateTime.now().minusHours(2),
                    members = listOf(member),
                    problems = listOf(problem),
                    frozenAt = ExecutionContext.get().startedAt.minusHours(1),
                )

            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
            every { memberRepository.findAllByContestIdAndType(contextContestId, Member.Type.CONTESTANT) } returns listOf(member)
            every { buildLeaderboardCellInternalUseCase.execute(any()) } returns
                Leaderboard.Cell(
                    memberId = member.id,
                    problemId = problem.id,
                    problemLetter = problem.letter,
                    problemColor = problem.color,
                    isAccepted = false,
                    acceptedAt = null,
                    wrongSubmissions = 0,
                    penalty = 0,
                )

            sut.execute()

            verify {
                buildLeaderboardCellInternalUseCase.execute(
                    withArg { command ->
                        command.submissions shouldBe emptyList()
                    },
                )
            }
        }
    })
