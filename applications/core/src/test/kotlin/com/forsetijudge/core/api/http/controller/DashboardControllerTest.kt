package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.port.input.usecase.dashboard.BuildAdminDashboardUseCase
import com.forsetijudge.core.port.input.usecase.dashboard.BuildContestantDashboardUseCase
import com.forsetijudge.core.port.input.usecase.dashboard.BuildJudgeDashboardUseCase
import com.forsetijudge.core.port.input.usecase.dashboard.BuildSpectatorDashboardUseCase
import com.forsetijudge.core.port.input.usecase.dashboard.BuildStaffDashboardUseCase
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

class DashboardControllerTest {
    private val buildAdminDashboardUseCase = mock<BuildAdminDashboardUseCase>()
    private val buildJudgeDashboardUseCase = mock<BuildJudgeDashboardUseCase>()
    private val buildStaffDashboardUseCase = mock<BuildStaffDashboardUseCase>()
    private val buildContestantDashboardUseCase = mock<BuildContestantDashboardUseCase>()
    private val buildSpectatorDashboardUseCase = mock<BuildSpectatorDashboardUseCase>()

    private val mvc =
        MockMvcTestSupport.mvc(
            DashboardController(
                buildAdminDashboardUseCase,
                buildJudgeDashboardUseCase,
                buildStaffDashboardUseCase,
                buildContestantDashboardUseCase,
                buildSpectatorDashboardUseCase,
            ),
        )
    private val contestId = UUID.randomUUID()

    @Test
    fun `routes dashboard requests and returns response bodies`() {
        whenever(buildAdminDashboardUseCase.execute(any())).thenReturn(
            MockMvcTestSupport.adminDashboardResponse(
                contestId,
            ),
        )
        whenever(buildJudgeDashboardUseCase.execute(any())).thenReturn(
            MockMvcTestSupport.judgeDashboardResponse(
                contestId,
            ),
        )
        whenever(buildStaffDashboardUseCase.execute(any())).thenReturn(
            MockMvcTestSupport.staffDashboardResponse(
                contestId,
            ),
        )
        whenever(buildContestantDashboardUseCase.execute(any())).thenReturn(
            MockMvcTestSupport.contestantDashboardResponse(
                contestId,
            ),
        )
        whenever(buildSpectatorDashboardUseCase.execute(any())).thenReturn(
            MockMvcTestSupport.spectatorDashboardResponse(
                contestId,
            ),
        )

        mvc
            .perform(get("/v1/contests/$contestId/dashboard/admin"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.contest.id").value(contestId.toString()))
        verify(buildAdminDashboardUseCase).execute(BuildAdminDashboardUseCase.Command(contestId))

        mvc
            .perform(get("/v1/contests/$contestId/dashboard/judge"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.contest.id").value(contestId.toString()))
        verify(buildJudgeDashboardUseCase).execute(BuildJudgeDashboardUseCase.Command(contestId))

        mvc
            .perform(get("/v1/contests/$contestId/dashboard/staff"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.contest.id").value(contestId.toString()))
        verify(buildStaffDashboardUseCase).execute(BuildStaffDashboardUseCase.Command(contestId))

        mvc
            .perform(get("/v1/contests/$contestId/dashboard/contestant"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.contest.id").value(contestId.toString()))
        verify(buildContestantDashboardUseCase).execute(BuildContestantDashboardUseCase.Command(contestId))

        mvc
            .perform(get("/v1/contests/$contestId/dashboard/spectator"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.contest.id").value(contestId.toString()))
        verify(buildSpectatorDashboardUseCase).execute(BuildSpectatorDashboardUseCase.Command(contestId))
    }
}
