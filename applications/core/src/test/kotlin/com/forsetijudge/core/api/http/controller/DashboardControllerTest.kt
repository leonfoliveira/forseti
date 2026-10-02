package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.port.input.usecase.dashboard.BuildAdminDashboardUseCase
import com.forsetijudge.core.port.input.usecase.dashboard.BuildContestantDashboardUseCase
import com.forsetijudge.core.port.input.usecase.dashboard.BuildGuestDashboardUseCase
import com.forsetijudge.core.port.input.usecase.dashboard.BuildJudgeDashboardUseCase
import java.util.UUID
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class DashboardControllerTest {
    private val admin = mock<BuildAdminDashboardUseCase>()
    private val contestant = mock<BuildContestantDashboardUseCase>()
    private val guest = mock<BuildGuestDashboardUseCase>()
    private val judge = mock<BuildJudgeDashboardUseCase>()
    private val mvc = MockMvcTestSupport.mvc(DashboardController(admin, contestant, guest, judge))
    private val contestId = UUID.randomUUID()

    @Test
    fun `routes dashboard requests and returns response bodies`() {
        whenever(admin.execute(any())).thenReturn(MockMvcTestSupport.adminDashboardResponse(contestId))
        whenever(contestant.execute(any())).thenReturn(MockMvcTestSupport.contestantDashboardResponse(contestId))
        whenever(guest.execute(any())).thenReturn(MockMvcTestSupport.guestDashboardResponse(contestId))
        whenever(judge.execute(any())).thenReturn(MockMvcTestSupport.judgeDashboardResponse(contestId))

        mvc.perform(get("/v1/contests/$contestId/dashboard/admin"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.contest.id").value(contestId.toString()))
        verify(admin).execute(BuildAdminDashboardUseCase.Command(contestId))

        mvc.perform(get("/v1/contests/$contestId/dashboard/contestant"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.contest.id").value(contestId.toString()))
        verify(contestant).execute(BuildContestantDashboardUseCase.Command(contestId))

        mvc.perform(get("/v1/contests/$contestId/dashboard/guest"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.contest.id").value(contestId.toString()))
        verify(guest).execute(BuildGuestDashboardUseCase.Command(contestId))

        mvc.perform(get("/v1/contests/$contestId/dashboard/judge"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.contest.id").value(contestId.toString()))
        verify(judge).execute(BuildJudgeDashboardUseCase.Command(contestId))
    }
}
