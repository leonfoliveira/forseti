package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.dashboard.StaffDashboard
import com.forsetijudge.core.port.dto.response.dashboard.StaffDashboardResponseDTO
import com.forsetijudge.core.port.dto.response.dashboard.toResponseDTO
import com.forsetijudge.core.port.input.usecase.dashboard.BuildStaffDashboardUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BuildStaffDashboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
    private val clarificationRepository: ClarificationRepository,
    private val leaderboardBuilder: LeaderboardBuilder,
) : BuildStaffDashboardUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Builds the staff dashboard by aggregating various metrics and information relevant to staffs.
     *
     * @param command The command containing the necessary parameters to build the staff dashboard.
     *
     * @return An StaffDashboardResponseDTO containing the aggregated data for the staff dashboard.
     */
    @Transactional(readOnly = true)
    override fun execute(command: BuildStaffDashboardUseCase.Command): StaffDashboardResponseDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Building staff dashboard")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id ${command.contestId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.STAFF)
            .throwIfErrors()

        val leaderboard = leaderboardBuilder.build(contest = contest)
        val submissions = submissionRepository.findAllByContestId(contest.id)
        val clarifications =
            clarificationRepository.findAllByContestIdAndIsPublic(contest.id)

        val dashboard =
            StaffDashboard(
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
