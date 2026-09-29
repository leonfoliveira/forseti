package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.port.dto.response.dashboard.AdminDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.ContestantDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.GuestDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.JudgeDashboardResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.dashboard.BuildAdminDashboardUseCase
import com.forsetijudge.core.port.input.usecase.dashboard.BuildContestantDashboardUseCase
import com.forsetijudge.core.port.input.usecase.dashboard.BuildGuestDashboardUseCase
import com.forsetijudge.core.port.input.usecase.dashboard.BuildJudgeDashboardUseCase
import com.forsetijudge.core.util.SafeLogger
import java.util.UUID
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class DashboardController(
    private val buildAdminDashboardUseCase: BuildAdminDashboardUseCase,
    private val buildContestantDashboardUseCase: BuildContestantDashboardUseCase,
    private val buildGuestDashboardUseCase: BuildGuestDashboardUseCase,
    private val buildJudgeDashboardUseCase: BuildJudgeDashboardUseCase,
) {
    private val logger = SafeLogger(this::class)

    @GetMapping("/contests/{contestId}/dashboard/admin")
    @PreAuthorize("hasRole('ADMIN')")
    fun getAdminDashboard(
        @PathVariable contestId: UUID,
    ): ResponseEntity<AdminDashboardResponseBodyDTO> {
        logger.info("[GET] /v1/contests/$contestId/dashboard/admin")
        val dashboard =
            buildAdminDashboardUseCase.execute(
                BuildAdminDashboardUseCase.Command(contestId),
            )
        return ResponseEntity.ok(dashboard)
    }

    @GetMapping("/contests/{contestId}/dashboard/contestant")
    @PreAuthorize("hasRole('CONTESTANT')")
    fun getContestantDashboard(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestantDashboardResponseBodyDTO> {
        logger.info("[GET] /v1/contests/$contestId/dashboard/contestant")
        val dashboard =
            buildContestantDashboardUseCase.execute(
                BuildContestantDashboardUseCase.Command(contestId),
            )
        return ResponseEntity.ok(dashboard)
    }

    @GetMapping("/contests/{contestId}/dashboard/guest")
    fun getGuestDashboard(
        @PathVariable contestId: UUID,
    ): ResponseEntity<GuestDashboardResponseBodyDTO> {
        logger.info("[GET] /v1/contests/$contestId/dashboard/guest")
        val dashboard =
            buildGuestDashboardUseCase.execute(
                BuildGuestDashboardUseCase.Command(contestId),
            )
        return ResponseEntity.ok(dashboard)
    }

    @GetMapping("/contests/{contestId}/dashboard/judge")
    @PreAuthorize("hasRole('JUDGE')")
    fun getJudgeDashboard(
        @PathVariable contestId: UUID,
    ): ResponseEntity<JudgeDashboardResponseBodyDTO> {
        logger.info("[GET] /v1/contests/$contestId/dashboard/judge")
        val dashboard =
            buildJudgeDashboardUseCase.execute(
                BuildJudgeDashboardUseCase.Command(contestId),
            )
        return ResponseEntity.ok(dashboard)
    }
}
