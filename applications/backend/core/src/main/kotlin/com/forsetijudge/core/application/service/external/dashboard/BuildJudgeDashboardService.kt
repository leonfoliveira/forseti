package com.forsetijudge.core.application.service.external.dashboard

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.dashboard.JudgeDashboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildJudgeDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.internal.leaderboard.BuildLeaderboardInternalUseCase
import com.forsetijudge.core.port.dto.response.dashboard.JudgeDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.toResponseBodyDTO
import org.springframework.stereotype.Service

@Service
class BuildJudgeDashboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
    private val ticketRepository: TicketRepository,
    private val buildLeaderboardInternalUseCase: BuildLeaderboardInternalUseCase,
) : BuildJudgeDashboardUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(): JudgeDashboardResponseBodyDTO {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Building guest dashboard")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id $contextContestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberType(Member.Type.JUDGE)
            .throwIfErrors()

        val leaderboard = buildLeaderboardInternalUseCase.execute(BuildLeaderboardInternalUseCase.Command(contest = contest))
        val submissions = submissionRepository.findAllByContestId(contest.id)
        val memberTickets = ticketRepository.findAllByContestIdAndMemberId(contest.id, contextMemberId)

        val dashboard =
            JudgeDashboard(
                contest = contest,
                leaderboard = leaderboard,
                members = contest.members,
                problems = contest.problems,
                submissions = submissions,
                clarifications = contest.clarifications,
                announcements = contest.announcements,
                memberTickets = memberTickets,
            )

        return dashboard.toResponseBodyDTO()
    }
}
