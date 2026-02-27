package com.forsetijudge.core.application.service.external.dashboard

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.unfreeze
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.dashboard.ContestantDashboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildContestantDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import org.springframework.stereotype.Service

@Service
class BuildContestantDashboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
) : BuildContestantDashboardUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(): ContestantDashboard {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Building contestant dashboard")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id $contextContestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberType(Member.Type.CONTESTANT)
            .throwIfErrors()

        val leaderboard = buildLeaderboardUseCase.execute()
        val submissions =
            contest.problems
                .map { problem -> if (contest.isFrozen) problem.frozenSubmissions.map { it.unfreeze() } else problem.submissions }
                .flatten()
        val memberSubmissions =
            contest.problems
                .map { it.submissions }
                .flatten()
                .filter { it.member.id == contextMemberId }

        return ContestantDashboard(
            contest = contest,
            leaderboard = leaderboard,
            members = contest.members,
            problems = contest.problems,
            submissions = submissions,
            memberSubmissions = memberSubmissions,
            clarifications = contest.clarifications,
            announcements = contest.announcements,
            memberTickets = contest.tickets.filter { it.member.id == contextMemberId },
        )
    }
}
