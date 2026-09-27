package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.dashboard.GuestDashboard
import com.forsetijudge.core.port.dto.response.dashboard.GuestDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.toResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.dashboard.BuildGuestDashboardUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BuildGuestDashboardService(
    private val contestRepository: ContestRepository,
    private val submissionRepository: SubmissionRepository,
    private val leaderboardBuilder: LeaderboardBuilder,
) : BuildGuestDashboardUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Builds the guest dashboard by aggregating various metrics and information relevant to guests.
     *
     * @param command The command containing the necessary parameters to build the guest dashboard.
     *
     * @return An GuestDashboardResultDTO containing the aggregated data for the guest dashboard.
     */
    @Transactional(readOnly = true)
    override fun execute(command: BuildGuestDashboardUseCase.Command): GuestDashboardResponseBodyDTO {
        logger.info("Building guest dashboard")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id ${command.contestId}")

        val leaderboard = leaderboardBuilder.build(contest = contest)
        val submissions = submissionRepository.findAllByContestId(contest.id)

        val dashboard =
            GuestDashboard(
                contest = contest,
                leaderboard = leaderboard,
                members = contest.members,
                problems = contest.problems,
                submissions = submissions,
            )

        return dashboard.toResponseBodyDTO()
    }
}
