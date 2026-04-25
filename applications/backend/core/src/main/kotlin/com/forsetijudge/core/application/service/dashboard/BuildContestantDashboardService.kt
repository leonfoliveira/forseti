package com.forsetijudge.core.application.service.dashboard

import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.unfreeze
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.dashboard.ContestantDashboard
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildContestantDashboardUseCase
import com.forsetijudge.core.port.dto.response.dashboard.ContestantDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.toResponseBodyDTO
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BuildContestantDashboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
    private val frozenSubmissionRepository: FrozenSubmissionRepository,
    private val ticketRepository: TicketRepository,
    private val leaderboardBuilder: LeaderboardBuilder,
) : BuildContestantDashboardUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional(readOnly = true)
    override fun execute(): ContestantDashboardResponseBodyDTO {
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
            .requireMemberType(Member.Type.CONTESTANT, Member.Type.UNOFFICIAL_CONTESTANT)
            .throwIfErrors()

        val leaderboard = leaderboardBuilder.build(contest = contest)
        val submissions =
            if (contest.isFrozen) {
                frozenSubmissionRepository.findAllByContestId(contest.id).map { it.unfreeze() }
            } else {
                submissionRepository.findAllByContestId(contest.id)
            }
        val memberSubmissions = submissionRepository.findAllByContestIdAndMemberId(contest.id, contextMemberId)
        val memberTickets = ticketRepository.findAllByContestIdAndMemberId(contest.id, contextMemberId)

        val dashboard =
            ContestantDashboard(
                contest = contest,
                leaderboard = leaderboard,
                members = contest.members,
                problems = contest.problems,
                submissions = submissions,
                memberSubmissions = memberSubmissions,
                clarifications = contest.clarifications,
                announcements = contest.announcements,
                memberTickets = memberTickets,
            )

        return dashboard.toResponseBodyDTO()
    }
}
