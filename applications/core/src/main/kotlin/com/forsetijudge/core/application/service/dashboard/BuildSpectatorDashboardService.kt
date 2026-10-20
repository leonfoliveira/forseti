package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.dashboard.SpectatorDashboard
import com.forsetijudge.core.port.dto.response.dashboard.SpectatorDashboardResponseDTO
import com.forsetijudge.core.port.dto.response.dashboard.toResponseDTO
import com.forsetijudge.core.port.input.usecase.dashboard.BuildSpectatorDashboardUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BuildSpectatorDashboardService(
    private val contestRepository: ContestRepository,
    private val submissionRepository: SubmissionRepository,
    private val frozenSubmissionRepository: FrozenSubmissionRepository,
    private val clarificationRepository: ClarificationRepository,
    private val leaderboardBuilder: LeaderboardBuilder,
) : BuildSpectatorDashboardUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Builds the spectator dashboard by aggregating various metrics and information relevant to spectators.
     *
     * @param command The command containing the necessary parameters to build the spectator dashboard.
     *
     * @return An BuildSpectatorDashboardUseCase containing the aggregated data for the spectator dashboard.
     */
    @Transactional(readOnly = true)
    override fun execute(command: BuildSpectatorDashboardUseCase.Command): SpectatorDashboardResponseDTO {
        logger.info("Building spectator dashboard")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id ${command.contestId}")

        ContestAuthorizer(contest)
            .requireContestStarted()
            .throwIfErrors()

        val leaderboard = leaderboardBuilder.build(contest = contest)
        val submissions =
            if (contest.isFrozen()) {
                frozenSubmissionRepository.findAllByContestId(contest.id)
            } else {
                submissionRepository.findAllByContestId(contest.id)
            }
        val clarifications = clarificationRepository.findAllByContestIdAndIsPublic(contest.id)

        val dashboard =
            SpectatorDashboard(
                contest = contest,
                leaderboard = leaderboard,
                members = contest.members,
                problems = contest.problems,
                submissions = submissions,
                announcements = contest.announcements,
                clarifications = clarifications,
            )

        return dashboard.toResponseDTO()
    }
}
