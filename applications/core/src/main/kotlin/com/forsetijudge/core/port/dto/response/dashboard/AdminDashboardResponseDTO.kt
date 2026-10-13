package com.forsetijudge.core.port.dto.response.dashboard

import com.forsetijudge.core.domain.model.dashboard.AdminDashboard
import com.forsetijudge.core.port.dto.response.announcement.AnnouncementResponseDTO
import com.forsetijudge.core.port.dto.response.announcement.toResponseDTO
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseDTO
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseDTO
import com.forsetijudge.core.port.dto.response.member.toResponseDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemWithTestCasesResponseDTO
import com.forsetijudge.core.port.dto.response.problem.toWithTestCasesResponseDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseDTO

data class AdminDashboardResponseDTO(
    val contest: ContestWithMembersAndProblemsResponseDTO,
    val leaderboard: LeaderboardResponseDTO,
    val members: List<MemberResponseDTO>,
    val problems: List<ProblemWithTestCasesResponseDTO>,
    val submissions: List<SubmissionWithCodeAndExecutionsResponseDTO>,
    val announcements: List<AnnouncementResponseDTO>,
)

fun AdminDashboard.toResponseDTO(): AdminDashboardResponseDTO =
    AdminDashboardResponseDTO(
        contest = contest.toWithMembersAndProblemsResponseDTO(),
        leaderboard = leaderboard.toResponseDTO(),
        members = members.map { it.toResponseDTO() },
        problems = problems.map { it.toWithTestCasesResponseDTO() },
        submissions = submissions.map { it.toWithCodeAndExecutionResponseDTO() },
        announcements = announcements.map { it.toResponseDTO() },
    )
