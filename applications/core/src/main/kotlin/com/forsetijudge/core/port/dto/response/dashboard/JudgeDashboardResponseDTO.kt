package com.forsetijudge.core.port.dto.response.dashboard

import com.forsetijudge.core.domain.model.dashboard.JudgeDashboard
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
import com.forsetijudge.core.port.dto.response.problem.ProblemWithTestCasesResponseDTO
import com.forsetijudge.core.port.dto.response.problem.toWithTestCasesResponseDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseDTO

data class JudgeDashboardResponseDTO(
    val contest: ContestResponseDTO,
    val leaderboard: LeaderboardResponseDTO,
    val members: List<MemberResponseDTO>,
    val problems: List<ProblemWithTestCasesResponseDTO>,
    val submissions: List<SubmissionWithCodeAndExecutionsResponseDTO>,
    val announcements: List<AnnouncementResponseDTO>,
    val clarifications: List<ClarificationResponseDTO>,
)

fun JudgeDashboard.toResponseDTO(): JudgeDashboardResponseDTO =
    JudgeDashboardResponseDTO(
        contest = contest.toResponseDTO(),
        leaderboard = leaderboard.toResponseDTO(),
        members = members.map { it.toResponseDTO() },
        problems = problems.map { it.toWithTestCasesResponseDTO() },
        submissions = submissions.map { it.toWithCodeAndExecutionResponseDTO() },
        announcements = announcements.map { it.toResponseDTO() },
        clarifications = clarifications.map { it.toResponseDTO() },
    )
