package com.forsetijudge.core.port.dto.response.dashboard

import com.forsetijudge.core.domain.model.dashboard.StaffDashboard
import com.forsetijudge.core.port.dto.response.announcement.AnnouncementResponseDTO
import com.forsetijudge.core.port.dto.response.announcement.toResponseDTO
import com.forsetijudge.core.port.dto.response.clarification.ClarificationResponseDTO
import com.forsetijudge.core.port.dto.response.clarification.toResponseDTO
import com.forsetijudge.core.port.dto.response.contest.ContestResponseDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseDTO
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseDTO
import com.forsetijudge.core.port.dto.response.member.toResponseDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemResponseDTO
import com.forsetijudge.core.port.dto.response.problem.toResponseDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseDTO

data class StaffDashboardResponseDTO(
    val contest: ContestResponseDTO,
    val leaderboard: LeaderboardResponseDTO,
    val members: List<MemberResponseDTO>,
    val problems: List<ProblemResponseDTO>,
    val submissions: List<SubmissionResponseDTO>,
    val announcements: List<AnnouncementResponseDTO>,
    val clarifications: List<ClarificationResponseDTO>,
)

fun StaffDashboard.toResponseDTO(): StaffDashboardResponseDTO =
    StaffDashboardResponseDTO(
        contest = contest.toResponseDTO(),
        leaderboard = leaderboard.toResponseDTO(),
        members = members.map { it.toResponseDTO() },
        problems = problems.map { it.toResponseDTO() },
        submissions = submissions.map { it.toResponseDTO() },
        announcements = announcements.map { it.toResponseDTO() },
        clarifications = clarifications.map { it.toResponseDTO() },
    )
