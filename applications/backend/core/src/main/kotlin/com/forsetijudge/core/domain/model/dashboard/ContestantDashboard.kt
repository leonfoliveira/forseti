package com.forsetijudge.core.domain.model.dashboard

import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.model.Leaderboard

/**
 * Represents the data to be displayed on the contestant dashboard of a contest.
 *
 * @property contest The contest for which the dashboard is being displayed.
 * @property leaderboard The current leaderboard of the contest.
 * @property members The list of members participating in the contest.
 * @property problems The list of problems in the contest.
 * @property submissions The list of submissions in the contest.
 * @property memberSubmissions The list of submissions made by the currently logged-in member in the contest.
 * @property clarifications The list of clarifications in the contest.
 * @property announcements The list of announcements in the contest.
 * @property memberTickets The list of tickets submitted by the currently logged-in member in the contest
 */
data class ContestantDashboard(
    val contest: Contest,
    val leaderboard: Leaderboard,
    val members: List<Member>,
    val problems: List<Problem>,
    val submissions: List<Submission>,
    val memberSubmissions: List<Submission>,
    val clarifications: List<Clarification>,
    val announcements: List<Announcement>,
    val memberTickets: List<Ticket<*>>,
)
