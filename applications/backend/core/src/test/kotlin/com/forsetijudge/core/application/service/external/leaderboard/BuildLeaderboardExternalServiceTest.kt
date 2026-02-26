package com.forsetijudge.core.application.service.external.leaderboard

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.internal.leaderboard.BuildLeaderboardCellInternalUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime

class BuildLeaderboardExternalServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val buildLeaderboardCellInternalUseCase = mockk<BuildLeaderboardCellInternalUseCase>(relaxed = true)

        val sut =
            BuildLeaderboardService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                buildLeaderboardCellInternalUseCase = buildLeaderboardCellInternalUseCase,
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
                        problemId = problemA.id,
                        problemLetter = problemA.letter,
                        problemColor = problemA.color,
                        isAccepted = false,
                        acceptedAt = null,
                        wrongSubmissions = 0,
                        penalty = 0,
                    ),
                    Leaderboard.Cell(
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
                        problemId = problemA.id,
                        problemLetter = problemA.letter,
                        problemColor = problemA.color,
                        isAccepted = false,
                        acceptedAt = null,
                        wrongSubmissions = 1,
                        penalty = 0,
                    ),
                    Leaderboard.Cell(
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
                        problemId = problemA.id,
                        problemLetter = problemA.letter,
                        problemColor = problemA.color,
                        isAccepted = true,
                        acceptedAt = ExecutionContext.Companion.get().startedAt,
                        wrongSubmissions = 0,
                        penalty = 0,
                    ),
                    Leaderboard.Cell(
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
                        problemId = problemA.id,
                        problemLetter = problemA.letter,
                        problemColor = problemA.color,
                        isAccepted = true,
                        acceptedAt = ExecutionContext.Companion.get().startedAt,
                        wrongSubmissions = 1,
                        penalty = 10,
                    ),
                    Leaderboard.Cell(
                        problemId = problemB.id,
                        problemLetter = problemB.letter,
                        problemColor = problemB.color,
                        isAccepted = false,
                        acceptedAt = null,
                        wrongSubmissions = 0,
                        penalty = 0,
                    ),
                    // memberWithDoubleAcceptedSubmission
                    Leaderboard.Cell(
                        problemId = problemA.id,
                        problemLetter = problemA.letter,
                        problemColor = problemA.color,
                        isAccepted = true,
                        acceptedAt = ExecutionContext.Companion.get().startedAt,
                        wrongSubmissions = 1,
                        penalty = 10,
                    ),
                    Leaderboard.Cell(
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
                                            problemId = problemA.id,
                                            problemLetter = problemA.letter,
                                            problemColor = problemA.color,
                                            isAccepted = true,
                                            acceptedAt = ExecutionContext.Companion.get().startedAt,
                                            wrongSubmissions = 1,
                                            penalty = 10,
                                        ),
                                        Leaderboard.Cell(
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
                                            problemId = problemA.id,
                                            problemLetter = problemA.letter,
                                            problemColor = problemA.color,
                                            isAccepted = true,
                                            acceptedAt = ExecutionContext.Companion.get().startedAt,
                                            wrongSubmissions = 0,
                                            penalty = 0,
                                        ),
                                        Leaderboard.Cell(
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
                                            problemId = problemA.id,
                                            problemLetter = problemA.letter,
                                            problemColor = problemA.color,
                                            isAccepted = true,
                                            acceptedAt = ExecutionContext.Companion.get().startedAt,
                                            wrongSubmissions = 1,
                                            penalty = 10,
                                        ),
                                        Leaderboard.Cell(
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
                                            problemId = problemA.id,
                                            problemLetter = problemA.letter,
                                            problemColor = problemA.color,
                                            isAccepted = false,
                                            acceptedAt = null,
                                            wrongSubmissions = 1,
                                            penalty = 0,
                                        ),
                                        Leaderboard.Cell(
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
                                            problemId = problemA.id,
                                            problemLetter = problemA.letter,
                                            problemColor = problemA.color,
                                            isAccepted = false,
                                            acceptedAt = null,
                                            wrongSubmissions = 0,
                                            penalty = 0,
                                        ),
                                        Leaderboard.Cell(
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
    })
