package com.forsetijudge.core.domain.model.dashboard

import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.entity.AnnouncementMockBuilder
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.ClarificationMockBuilder
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.entity.TicketMockBuilder
import com.forsetijudge.core.domain.model.Leaderboard
import com.forsetijudge.core.domain.model.LeaderboardMockBuilder
import java.io.Serializable

object JudgeDashboardMockBuilder {
    fun build(
        contest: Contest = ContestMockBuilder.build(),
        leaderboard: Leaderboard = LeaderboardMockBuilder.build(),
        members: List<Member> = listOf(MemberMockBuilder.build()),
        problems: List<Problem> = listOf(ProblemMockBuilder.build()),
        submissions: List<Submission> = listOf(SubmissionMockBuilder.build()),
        clarifications: List<Clarification> = listOf(ClarificationMockBuilder.build()),
        announcements: List<Announcement> = listOf(AnnouncementMockBuilder.build()),
        memberTickets: List<Ticket<*>> = listOf(TicketMockBuilder.build<Serializable>()),
    ) = JudgeDashboard(
        contest = contest,
        leaderboard = leaderboard,
        members = members,
        problems = problems,
        submissions = submissions,
        clarifications = clarifications,
        announcements = announcements,
        memberTickets = memberTickets,
    )
}
