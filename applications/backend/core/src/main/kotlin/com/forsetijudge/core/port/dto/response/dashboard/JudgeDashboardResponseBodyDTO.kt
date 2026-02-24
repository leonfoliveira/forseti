package com.forsetijudge.core.port.dto.response.dashboard

import com.forsetijudge.core.domain.model.dashboard.JudgeDashboard
import com.forsetijudge.core.port.dto.response.announcement.AnnouncementResponseBodyDTO
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.clarification.ClarificationResponseDTO
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemWithTestCasesResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.toWithTestCasesResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.ticket.TicketResponseBodyDTO
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO

data class JudgeDashboardResponseBodyDTO(
    val contest: ContestResponseBodyDTO,
    val leaderboard: LeaderboardResponseBodyDTO,
    val members: List<MemberResponseBodyDTO>,
    val problems: List<ProblemWithTestCasesResponseBodyDTO>,
    val submissions: List<SubmissionWithCodeAndExecutionResponseBodyDTO>,
    val clarifications: List<ClarificationResponseDTO>,
    val announcements: List<AnnouncementResponseBodyDTO>,
    val memberTickets: List<TicketResponseBodyDTO>,
)

fun JudgeDashboard.toResponseBodyDTO(): JudgeDashboardResponseBodyDTO =
    JudgeDashboardResponseBodyDTO(
        contest = contest.toResponseBodyDTO(),
        leaderboard = leaderboard.toResponseBodyDTO(),
        members = members.map { it.toResponseBodyDTO() },
        problems = problems.map { it.toWithTestCasesResponseBodyDTO() },
        submissions = submissions.map { it.toWithCodeAndExecutionResponseBodyDTO() },
        clarifications = clarifications.map { it.toResponseBodyDTO() },
        announcements = announcements.map { it.toResponseBodyDTO() },
        memberTickets = memberTickets.map { it.toResponseBodyDTO() },
    )
