package com.forsetijudge.core.port.dto.response.dashboard

import com.forsetijudge.core.domain.model.dashboard.StaffDashboard
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
import com.forsetijudge.core.port.dto.response.problem.ProblemResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.ticket.TicketResponseBodyDTO
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO

data class StaffDashboardResponseBodyDTO(
    val contest: ContestResponseBodyDTO,
    val leaderboard: LeaderboardResponseBodyDTO,
    val members: List<MemberResponseBodyDTO>,
    val problems: List<ProblemResponseBodyDTO>,
    val submissions: List<SubmissionResponseBodyDTO>,
    val clarification: List<ClarificationResponseDTO>,
    val announcements: List<AnnouncementResponseBodyDTO>,
    val tickets: List<TicketResponseBodyDTO>,
    val memberTickets: List<TicketResponseBodyDTO>,
)

fun StaffDashboard.toResponseBodyDTO(): StaffDashboardResponseBodyDTO =
    StaffDashboardResponseBodyDTO(
        contest = contest.toResponseBodyDTO(),
        leaderboard = leaderboard.toResponseBodyDTO(),
        members = members.map { it.toResponseBodyDTO() },
        problems = problems.map { it.toResponseBodyDTO() },
        submissions = submissions.map { it.toResponseBodyDTO() },
        clarification = clarifications.map { it.toResponseBodyDTO() },
        announcements = announcements.map { it.toResponseBodyDTO() },
        tickets = tickets.map { it.toResponseBodyDTO() },
        memberTickets = memberTickets.map { it.toResponseBodyDTO() },
    )
