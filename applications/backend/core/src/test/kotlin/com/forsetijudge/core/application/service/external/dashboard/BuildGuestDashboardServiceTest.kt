package com.forsetijudge.core.application.service.external.dashboard

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.domain.model.LeaderboardMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime

class BuildGuestDashboardServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>()
        val buildLeaderboardUseCase = mockk<BuildLeaderboardUseCase>()

        val sut =
            BuildGuestDashboardService(
                contestRepository = contestRepository,
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

        test("should throw NotFoundException if guest dashboard is not enabled") {
            val contest = ContestMockBuilder.build(settings = Contest.Settings(isGuestEnabled = false))
            every { contestRepository.findById(contestId) } returns contest

            shouldThrow<NotFoundException> {
                sut.execute()
            }
        }

        test("should build guest dashboard successfully") {
            val contest = ContestMockBuilder.build()
            val leaderboard = LeaderboardMockBuilder.build()
            every { contestRepository.findById(contestId) } returns contest
            every { buildLeaderboardUseCase.execute(BuildLeaderboardUseCase.Command()) } returns leaderboard

            val dashboard = sut.execute()

            dashboard.contest shouldBe contest
            dashboard.leaderboard shouldBe leaderboard
            dashboard.members shouldBe contest.members
            dashboard.problems shouldBe contest.problems
            dashboard.submissions shouldBe contest.problems.map { it.submissions }.flatten()
            dashboard.clarifications shouldBe contest.clarifications
            dashboard.announcements shouldBe contest.announcements
        }

        test("should build guest dashboard with frozen submissions") {
            val contest = ContestMockBuilder.build(frozenAt = OffsetDateTime.now().minusHours(1))
            val leaderboard = LeaderboardMockBuilder.build()
            every { contestRepository.findById(contestId) } returns contest
            every { buildLeaderboardUseCase.execute(BuildLeaderboardUseCase.Command()) } returns leaderboard

            val dashboard = sut.execute()

            dashboard.submissions shouldBe contest.problems.map { it.frozenSubmissions }.flatten()
        }
    })
