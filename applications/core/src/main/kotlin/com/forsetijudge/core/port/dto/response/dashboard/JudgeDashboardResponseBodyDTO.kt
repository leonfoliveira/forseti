package com.forsetijudge.core.port.dto.response.dashboard

import com.forsetijudge.core.domain.model.dashboard.JudgeDashboard
import com.forsetijudge.core.port.dto.response.contest.ContestResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.LeaderboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.MemberResponseBodyDTO
import com.forsetijudge.core.port.dto.response.member.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.ProblemWithTestCasesResponseBodyDTO
import com.forsetijudge.core.port.dto.response.problem.toWithTestCasesResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeAndExecutionsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO

data class JudgeDashboardResponseBodyDTO(
    val contest: ContestResponseBodyDTO,
    val leaderboard: LeaderboardResponseBodyDTO,
    val members: List<MemberResponseBodyDTO>,
    val problems: List<ProblemWithTestCasesResponseBodyDTO>,
    val submissions: List<SubmissionWithCodeAndExecutionsResponseBodyDTO>,
)

fun JudgeDashboard.toResponseBodyDTO(): JudgeDashboardResponseBodyDTO =
    JudgeDashboardResponseBodyDTO(
        contest = contest.toResponseBodyDTO(),
        leaderboard = leaderboard.toResponseBodyDTO(),
        members = members.map { it.toResponseBodyDTO() },
        problems = problems.map { it.toWithTestCasesResponseBodyDTO() },
        submissions = submissions.map { it.toWithCodeAndExecutionResponseBodyDTO() },
    )
