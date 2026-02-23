package com.forsetijudge.core.application.service.external.dashboard

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.dashboard.AdminDashboard
import com.forsetijudge.core.domain.model.dashboard.ContestantDashboard
import com.forsetijudge.core.domain.model.dashboard.GuestDashboard
import com.forsetijudge.core.domain.model.dashboard.JudgeDashboard
import com.forsetijudge.core.domain.model.dashboard.StaffDashboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildAdminDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildContestantDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildGuestDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildJudgeDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildStaffDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class BuildStaffDashboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
) : BuildStaffDashboardUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

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
            memberTickets = contest.tickets.filter { it.memberId == contextMemberId },
        )
    }
}
