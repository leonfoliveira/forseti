package com.forsetijudge.core.api.http.sse

import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class SSERoomBuilderTest {
    @Test
    fun `test buildAdminDashboardRoom`() {
        val contestId = IdGenerator.getUUID()
        val roomName = SSERoomBuilder.buildAdminDashboardRoom(contestId)
        assertEquals(roomName, "admin-dashboard-$contestId")
    }

    @Test
    fun `test buildContestantDashboardRoom`() {
        val contestId = IdGenerator.getUUID()
        val roomName = SSERoomBuilder.buildContestantDashboardRoom(contestId)
        assertEquals(roomName, "contestant-dashboard-$contestId")
    }

    @Test
    fun `test buildJudgeDashboardRoom`() {
        val contestId = IdGenerator.getUUID()
        val roomName = SSERoomBuilder.buildJudgeDashboardRoom(contestId)
        assertEquals(roomName, "judge-dashboard-$contestId")
    }

    @Test
    fun `test buildGuestDashboardRoom`() {
        val contestId = IdGenerator.getUUID()
        val roomName = SSERoomBuilder.buildGuestDashboardRoom(contestId)
        assertEquals(roomName, "guest-dashboard-$contestId")
    }

    @Test
    fun `test buildMemberPrivateRoom`() {
        val memberId = IdGenerator.getUUID()
        val roomName = SSERoomBuilder.buildMemberPrivateRoom(memberId)
        assertEquals(roomName, "member-private-$memberId")
    }
}
