package com.forsetijudge.core.application.service.external.dashboard

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.unfreeze
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.dashboard.GuestDashboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildGuestDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import org.springframework.stereotype.Service

@Service
class BuildGuestDashboardService(
    private val contestRepository: ContestRepository,
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
) : BuildGuestDashboardUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(): GuestDashboard {
        val contextContestId = ExecutionContext.getContestId()

        logger.info("Building guest dashboard")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id $contextContestId")

        if (!contest.settings.isGuestEnabled) {
            throw NotFoundException("Guest dashboard is not enabled for this contest")
        }

        val leaderboard = buildLeaderboardUseCase.execute()
        val submissions =
            contest.problems
                .map { problem -> if (contest.isFrozen) problem.frozenSubmissions.map { it.unfreeze() } else problem.submissions }
                .flatten()

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
