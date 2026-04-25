package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.dashboard.AdminDashboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildAdminDashboardUseCase
import com.forsetijudge.core.port.dto.response.dashboard.AdminDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.toResponseBodyDTO
import org.springframework.stereotype.Service

@Service
class BuildAdminDashboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
    private val ticketRepository: TicketRepository,
    private val leaderboardBuilder: LeaderboardBuilder,
) : BuildAdminDashboardUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(): AdminDashboardResponseBodyDTO {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Building admin dashboard")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id $contextContestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .throwIfErrors()

        val leaderboard = leaderboardBuilder.build(contest = contest)
        val submissions = submissionRepository.findAllByContestId(contest.id)
        val memberTickets = ticketRepository.findAllByContestIdAndMemberId(contest.id, contextMemberId)

        val dashboard =
            AdminDashboard(
                contest = contest,
                leaderboard = leaderboard,
                members = contest.members,
                problems = contest.problems,
                submissions = submissions,
                clarifications = contest.clarifications,
                announcements = contest.announcements,
                tickets = contest.tickets,
                memberTickets = memberTickets,
            )

        return dashboard.toResponseBodyDTO()
    }
}
