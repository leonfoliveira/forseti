package com.forsetijudge.core.api.http.sse

import com.forsetijudge.core.api.http.controller.MockMvcTestSupport
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.request
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class SSEControllerTest {
    val sseAuthorizer = mock<SSEAuthorizer>()
    val sseHelper = mock<SSEHelper>()
    val mvc = MockMvcTestSupport.mvc(SSEController(sseAuthorizer, sseHelper))
    val contestId = IdGenerator.getUUID()
    val memberId = IdGenerator.getUUID()

    @Test
    fun `test subscribe to admin dashboard room`() {
        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/admin"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseAuthorizer).authorizeToAdminDashboardRoom(contestId)
        verify(sseHelper).subscribe(eq(SSERoomBuilder.buildAdminDashboardRoom(contestId)), any())

        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/admin").header("Last-Event-ID", "123"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseHelper).emitMissedMessages(eq(SSERoomBuilder.buildAdminDashboardRoom(contestId)), eq("123"), any())
    }

    @Test
    fun `test subscribe to judge dashboard room`() {
        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/judge"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseAuthorizer).authorizeToJudgeDashboardRoom(contestId)
        verify(sseHelper).subscribe(eq(SSERoomBuilder.buildJudgeDashboardRoom(contestId)), any())

        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/judge").header("Last-Event-ID", "456"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseHelper).emitMissedMessages(eq(SSERoomBuilder.buildJudgeDashboardRoom(contestId)), eq("456"), any())
    }

    @Test
    fun `test subscribe to staff dashboard room`() {
        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/staff"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseAuthorizer).authorizeToStaffDashboardRoom(contestId)
        verify(sseHelper).subscribe(eq(SSERoomBuilder.buildStaffDashboardRoom(contestId)), any())

        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/staff").header("Last-Event-ID", "789"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseHelper).emitMissedMessages(eq(SSERoomBuilder.buildStaffDashboardRoom(contestId)), eq("789"), any())
    }

    @Test
    fun `test subscribe to contestant dashboard room`() {
        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/contestant"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseAuthorizer).authorizeToContestantDashboardRoom(contestId)
        verify(sseHelper).subscribe(eq(SSERoomBuilder.buildContestantDashboardRoom(contestId)), any())

        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/contestant").header("Last-Event-ID", "101112"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseHelper).emitMissedMessages(
            eq(SSERoomBuilder.buildContestantDashboardRoom(contestId)),
            eq("101112"),
            any(),
        )
    }

    @Test
    fun `test subscribe to spectator dashboard room`() {
        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/spectator"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseAuthorizer).authorizeToSpectatorDashboardRoom(contestId)
        verify(sseHelper).subscribe(eq(SSERoomBuilder.buildSpectatorDashboardRoom(contestId)), any())

        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/spectator").header("Last-Event-ID", "131415"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseHelper).emitMissedMessages(
            eq(SSERoomBuilder.buildSpectatorDashboardRoom(contestId)),
            eq("131415"),
            any(),
        )
    }

    @Test
    fun `test subscribe to member private room`() {
        mvc
            .perform(
                get("/v1/sse/members/$memberId"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        sseAuthorizer.authorizeToMemberPrivateRoom(memberId)
        verify(sseHelper).subscribe(eq(SSERoomBuilder.buildMemberPrivateRoom(memberId)), any())

        mvc
            .perform(
                get("/v1/sse/members/$memberId").header("Last-Event-ID", "161718"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseHelper).emitMissedMessages(eq(SSERoomBuilder.buildMemberPrivateRoom(memberId)), eq("161718"), any())
    }
}
