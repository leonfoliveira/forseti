package com.forsetijudge.core.port.dto.response.dashboard

import com.forsetijudge.core.domain.model.dashboard.ContestantDashboard
import com.forsetijudge.core.port.dto.response.announcement.AnnouncementResponseDTO
import com.forsetijudge.core.port.dto.response.announcement.toResponseDTO
import com.forsetijudge.core.port.dto.response.contest.ContestResponseDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseDTO
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseDTO
import com.forsetijudge.core.port.dto.response.member.toResponseDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemResponseDTO
import com.forsetijudge.core.port.dto.response.problem.toResponseDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionResponseDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseDTO

data class ContestantDashboardResponseDTO(
    val contest: ContestResponseDTO,
    val leaderboard: LeaderboardResponseDTO,
    val members: List<MemberResponseDTO>,
    val problems: List<ProblemResponseDTO>,
    val submissions: List<SubmissionResponseDTO>,
    val memberSubmissions: List<SubmissionWithCodeResponseDTO>,
    val announcements: List<AnnouncementResponseDTO>,
)

fun ContestantDashboard.toResponseDTO(): ContestantDashboardResponseDTO =
    ContestantDashboardResponseDTO(
        contest = contest.toResponseDTO(),
        leaderboard = leaderboard.toResponseDTO(),
        members = members.map { it.toResponseDTO() },
        problems = problems.map { it.toResponseDTO() },
        submissions = submissions.map { it.toResponseDTO() },
        memberSubmissions = memberSubmissions.map { it.toWithCodeResponseDTO() },
        announcements = announcements.map { it.toResponseDTO() },
    )
