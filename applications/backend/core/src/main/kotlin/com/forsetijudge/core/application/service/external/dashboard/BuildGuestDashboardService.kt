package com.forsetijudge.core.application.service.external.dashboard

import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.dashboard.GuestDashboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildGuestDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class BuildGuestDashboardService(
    private val contestRepository: ContestRepository,
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
) : BuildGuestDashboardUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun execute(): GuestDashboard {
        val contextContestId = ExecutionContext.getContestId()

        logger.info("Building guest dashboard")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id $contextContestId")

        val leaderboard = buildLeaderboardUseCase.execute()
        val submissions = contest.problems.map { it.submissions }.flatten()

        return GuestDashboard(
            contest = contest,
            leaderboard = leaderboard,
            members = contest.members,
            problems = contest.problems,
            submissions = submissions,
            clarifications = contest.clarifications,
            announcements = contest.announcements,
        )
    }
}
