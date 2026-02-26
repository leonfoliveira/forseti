package com.forsetijudge.core.application.service.external.dashboard

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.dashboard.StaffDashboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildStaffDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import org.springframework.stereotype.Service

@Service
class BuildStaffDashboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
) : BuildStaffDashboardUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(): StaffDashboard {
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
            .requireMemberType(Member.Type.STAFF)
            .throwIfErrors()

        val leaderboard = buildLeaderboardUseCase.execute()
        val submissions = contest.problems.map { it.submissions }.flatten()

        return StaffDashboard(
            contest = contest,
            leaderboard = leaderboard,
            members = contest.members,
            problems = contest.problems,
            submissions = submissions,
            clarifications = contest.clarifications,
            announcements = contest.announcements,
            tickets = contest.tickets,
            memberTickets = contest.tickets.filter { it.member.id == contextMemberId },
        )
    }
}
