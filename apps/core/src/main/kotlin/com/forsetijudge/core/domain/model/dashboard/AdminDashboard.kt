package com.forsetijudge.core.domain.model.dashboard

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.model.Leaderboard

/**
 * Represents the data to be displayed on the admin dashboard of a contest.
 *
 * @property contest The contest for which the dashboard is being displayed.
 * @property leaderboard The current leaderboard of the contest.
 * @property members The list of members participating in the contest.
 * @property problems The list of problems in the contest.
 * @property submissions The list of submissions in the contest.
 */
data class AdminDashboard(
    val contest: Contest,
    val leaderboard: Leaderboard,
    val members: List<Member>,
    val problems: List<Problem>,
    val submissions: List<Submission>,
)
