package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.dashboard.JudgeDashboard
import com.forsetijudge.core.port.dto.response.dashboard.JudgeDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.toResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.dashboard.BuildJudgeDashboardUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BuildJudgeDashboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
    private val leaderboardBuilder: LeaderboardBuilder,
) : BuildJudgeDashboardUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Builds the judge dashboard by aggregating various metrics and information relevant to judges.
     *
     * @param command The command containing the necessary parameters to build the judge dashboard.
     *
     * @return An JudgeDashboardResultDTO containing the aggregated data for the judge dashboard.
     */
    @Transactional(readOnly = true)
    override fun execute(command: BuildJudgeDashboardUseCase.Command): JudgeDashboardResponseBodyDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Building guest dashboard")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id ${command.contestId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.JUDGE)
            .throwIfErrors()

        val leaderboard = leaderboardBuilder.build(contest = contest)
        val submissions = submissionRepository.findAllByContestId(contest.id)

        val dashboard =
            JudgeDashboard(
                contest = contest,
                leaderboard = leaderboard,
                members = contest.members,
                problems = contest.problems,
                submissions = submissions,
            )

        return dashboard.toResponseBodyDTO()
    }
}
