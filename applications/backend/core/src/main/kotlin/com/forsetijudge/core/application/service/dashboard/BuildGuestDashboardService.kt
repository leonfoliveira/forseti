package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.unfreeze
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.dashboard.GuestDashboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildGuestDashboardUseCase
import com.forsetijudge.core.port.dto.response.dashboard.GuestDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.toResponseBodyDTO
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BuildGuestDashboardService(
    private val contestRepository: ContestRepository,
    private val submissionRepository: SubmissionRepository,
    private val frozenSubmissionRepository: FrozenSubmissionRepository,
    private val leaderboardBuilder: LeaderboardBuilder,
) : BuildGuestDashboardUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional(readOnly = true)
    override fun execute(): GuestDashboardResponseBodyDTO {
        val contextContestId = ExecutionContext.getContestId()

        logger.info("Building guest dashboard")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id $contextContestId")

        if (!contest.settings.isGuestEnabled) {
            throw NotFoundException("Guest dashboard is not enabled for this contest")
        }

        val leaderboard = leaderboardBuilder.build(contest = contest)
        val submissions =
            if (contest.isFrozen) {
                frozenSubmissionRepository.findAllByContestId(contest.id).map { it.unfreeze() }
            } else {
                submissionRepository.findAllByContestId(contest.id)
            }

        val dashboard =
            GuestDashboard(
                contest = contest,
                leaderboard = leaderboard,
                members = contest.members,
                problems = contest.problems,
                submissions = submissions,
                clarifications = contest.clarifications,
                announcements = contest.announcements,
            )

        return dashboard.toResponseBodyDTO()
    }
}
