package com.forsetijudge.core.port.dto.response.dashboard

import com.forsetijudge.core.domain.model.dashboard.AdminDashboard
import com.forsetijudge.core.port.dto.response.announcement.AnnouncementResponseBodyDTO
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemWithTestCasesResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.toWithTestCasesResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO

data class AdminDashboardResponseBodyDTO(
    val contest: ContestWithMembersAndProblemsResponseBodyDTO,
    val leaderboard: LeaderboardResponseBodyDTO,
    val members: List<MemberResponseBodyDTO>,
    val problems: List<ProblemWithTestCasesResponseBodyDTO>,
    val submissions: List<SubmissionWithCodeAndExecutionsResponseBodyDTO>,
    val announcements: List<AnnouncementResponseBodyDTO>,
)

fun AdminDashboard.toResponseBodyDTO(): AdminDashboardResponseBodyDTO =
    AdminDashboardResponseBodyDTO(
        contest = contest.toWithMembersAndProblemsResponseBodyDTO(),
        leaderboard = leaderboard.toResponseBodyDTO(),
        members = members.map { it.toResponseBodyDTO() },
        problems = problems.map { it.toWithTestCasesResponseBodyDTO() },
        submissions = submissions.map { it.toWithCodeAndExecutionResponseBodyDTO() },
        announcements = announcements.map { it.toResponseBodyDTO() },
    )
