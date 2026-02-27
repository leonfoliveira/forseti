package com.forsetijudge.core.application.service.external.leaderboard

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.port.driven.cache.LeaderboardCacheStore
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardCellUseCase
import com.forsetijudge.core.port.driving.usecase.internal.leaderboard.BuildLeaderboardCellInternalUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime

class BuildLeaderboardCellServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val problemRepository = mockk<ProblemRepository>(relaxed = true)
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val buildLeaderboardCellInternalUseCase = mockk<BuildLeaderboardCellInternalUseCase>(relaxed = true)

        val sut =
            BuildLeaderboardCellService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                problemRepository = problemRepository,
                submissionRepository = submissionRepository,
                buildLeaderboardCellInternalUseCase = buildLeaderboardCellInternalUseCase,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        val problemId = IdGenerator.getUUID()
        val memberId = IdGenerator.getUUID()

        val command =
            BuildLeaderboardCellUseCase.Command(
                memberId = memberId,
                problemId = problemId,
            )

        test("should throw NotFoundException when contest not found") {
            every { contestRepository.findById(contextContestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        test("should throw NotFoundException when context member not found") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        test("should throw ForbiddenException when contest not started and context member cannot access not started contest") {
            val contest =
                ContestMockBuilder.build(
                    startAt = OffsetDateTime.now().plusHours(1),
                )
            val contextMember =
                MemberMockBuilder.build(
                    type = Member.Type.CONTESTANT,
                )
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns contextMember

            shouldThrow<ForbiddenException> {
                sut.execute(command)
            }
        }

        test("should throw NotFoundException when member not found") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns
                MemberMockBuilder.build(type = Member.Type.ADMIN)
            every { memberRepository.findByIdAndContestId(command.memberId, contest.id) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        test("should throw NotFoundException when problem not found") {
            val contest = ContestMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns
                MemberMockBuilder.build(type = Member.Type.ADMIN)
            every { memberRepository.findByIdAndContestId(command.memberId, contest.id) } returns MemberMockBuilder.build()
            every { problemRepository.findByIdAndContestId(problemId, contest.id) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        test("should return result from internal use case") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build()
            val problem = ProblemMockBuilder.build()
            every { contestRepository.findById(contextContestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns
                MemberMockBuilder.build(type = Member.Type.ADMIN)
            every { memberRepository.findByIdAndContestId(command.memberId, contest.id) } returns member
            every { problemRepository.findByIdAndContestId(problemId, contest.id) } returns problem
            val cell =
                Leaderboard.Cell(
                    memberId = member.id,
                    problemId = problem.id,
                    problemLetter = 'A',
                    problemColor = "#ffffff",
                    isAccepted = false,
                    acceptedAt = null,
                    wrongSubmissions = 0,
                    penalty = 0,
                )
            every { buildLeaderboardCellInternalUseCase.execute(any()) } returns cell
            val command = BuildLeaderboardCellUseCase.Command(problemId = problemId, memberId = memberId)

            val result = sut.execute(command)

            result shouldBe cell
        }
    })
