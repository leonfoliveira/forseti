package com.forsetijudge.core.application.service.external.dashboard

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.domain.model.LeaderboardMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk

class BuildAdminDashboardServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>()
        val memberRepository = mockk<MemberRepository>()
        val buildLeaderboardUseCase = mockk<BuildLeaderboardUseCase>()

        val sut =
            BuildAdminDashboardService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                buildLeaderboardUseCase = buildLeaderboardUseCase,
            )

        val contestId = IdGenerator.getUUID()
        val memberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId, memberId)
        }

        test("should throw NotFoundException if contest is not found") {
            every { contestRepository.findById(contestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute()
            }
        }

        test("should throw NotFoundException if member is not found") {
            every { contestRepository.findById(contestId) } returns ContestMockBuilder.build()
            every { memberRepository.findByIdAndContestIdOrContestIsNull(memberId, contestId) } returns null

            shouldThrow<NotFoundException> {
                sut.execute()
            }
        }

        test("should throw ForbiddenException if member is not admin or root") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
            every { contestRepository.findById(contestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(memberId, contestId) } returns member

            shouldThrow<ForbiddenException> {
                sut.execute()
            }
        }

        test("should build admin dashboard successfully") {
            val contest = ContestMockBuilder.build()
            val member = MemberMockBuilder.build(type = Member.Type.ADMIN)
            val leaderboard = LeaderboardMockBuilder.build()
            every { contestRepository.findById(contestId) } returns contest
            every { memberRepository.findByIdAndContestIdOrContestIsNull(memberId, contestId) } returns member
            every { buildLeaderboardUseCase.execute() } returns leaderboard

            val dashboard = sut.execute()

            dashboard.contest shouldBe contest
            dashboard.leaderboard shouldBe leaderboard
            dashboard.members shouldBe contest.members
            dashboard.problems shouldBe contest.problems
            dashboard.submissions shouldBe contest.problems.map { it.submissions }.flatten()
            dashboard.clarifications shouldBe contest.clarifications
            dashboard.announcements shouldBe contest.announcements
            dashboard.tickets shouldBe contest.tickets
            dashboard.memberTickets shouldBe contest.tickets.filter { it.memberId == memberId }
        }
    })
