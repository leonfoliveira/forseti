package com.forsetijudge.core.application.service.external.dashboard

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.dashboard.JudgeDashboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildJudgeDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import org.springframework.stereotype.Service

@Service
class BuildJudgeDashboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
) : BuildJudgeDashboardUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(): JudgeDashboard {
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

        val leaderboard = buildLeaderboardUseCase.execute(BuildLeaderboardUseCase.Command())
        val submissions = contest.problems.map { it.submissions }.flatten()

        return JudgeDashboard(
            contest = contest,
            leaderboard = leaderboard,
            members = contest.members,
            problems = contest.problems,
            submissions = submissions,
            clarifications = contest.clarifications,
            announcements = contest.announcements,
            memberTickets = contest.tickets.filter { it.member.id == contextMemberId },
        )
    }
}
