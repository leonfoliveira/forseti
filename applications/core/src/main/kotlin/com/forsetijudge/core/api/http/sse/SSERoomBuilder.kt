package com.forsetijudge.core.api.http.sse

import java.util.UUID

object SSERoomBuilder {
    /**
     * Build a room name for sse events related to an admin dashboard.
     *
     * @param contestId The ID of the contest.
     * @return The room name for the admin dashboard.
     */
    fun buildAdminDashboardRoom(contestId: UUID): String = "admin-dashboard-$contestId"

    /**
     * Build a room name for sse events related to a judge dashboard.
     *
     * @param contestId The ID of the contest.
     * @return The room name for the judge dashboard.
     */
    fun buildJudgeDashboardRoom(contestId: UUID): String = "judge-dashboard-$contestId"

    /**
     * Build a room name for sse events related to a staff dashboard.
     *
     * @param contestId The ID of the contest.
     * @return The room name for the staff dashboard.
     */
    fun buildStaffDashboardRoom(contestId: UUID): String = "staff-dashboard-$contestId"

    /**
     * Build a room name for sse events related to a contestant dashboard.
     *
     * @param contestId The ID of the contest.
     * @return The room name for the contestant dashboard.
     */
    fun buildContestantDashboardRoom(contestId: UUID): String = "contestant-dashboard-$contestId"

    /**
     * Build a room name for sse events related to a spectator dashboard.
     *
     * @param contestId The ID of the contest.
     * @return The room name for the spectator dashboard.
     */
    fun buildSpectatorDashboardRoom(contestId: UUID): String = "spectator-dashboard-$contestId"

    /**
     * Build a room name for sse events related to a member private room.
     *
     * @param memberId The ID of the member.
     * @return The room name for the member private room.
     */
    fun buildMemberPrivateRoom(memberId: UUID): String = "member-private-$memberId"
}
