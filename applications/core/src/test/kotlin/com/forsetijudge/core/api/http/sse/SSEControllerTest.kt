package com.forsetijudge.core.api.http.sse

import com.forsetijudge.core.api.http.controller.MockMvcTestSupport
import com.forsetijudge.core.util.IdGenerator
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.request
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class SSEControllerTest {
    val sseAuthorizer = mock<SSEAuthorizer>()
    val mvc = MockMvcTestSupport.mvc(SSEController(sseAuthorizer))
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
    }

    @Test
    fun `test subscribe to contestant dashboard room`() {
        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/contestant"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseAuthorizer).authorizeToContestantDashboardRoom(contestId)
    }

    @Test
    fun `test subscribe to judge dashboard room`() {
        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/judge"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseAuthorizer).authorizeToJudgeDashboardRoom(contestId)
    }

    @Test
    fun `test subscribe to guest dashboard room`() {
        mvc
            .perform(
                get("/v1/sse/contests/$contestId/dashboard/guest"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        verify(sseAuthorizer).authorizeToGuestDashboardRoom(contestId)
    }

    @Test
    fun `test subscribe to member private room`() {
        mvc
            .perform(
                get("/v1/sse/members/$memberId"),
            ).andExpect(status().isOk)
            .andExpect(request().asyncStarted())
        sseAuthorizer.authorizeToMemberPrivateRoom(memberId)
    }
}
