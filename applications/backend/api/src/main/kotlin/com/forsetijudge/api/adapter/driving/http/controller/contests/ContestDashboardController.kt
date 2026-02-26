package com.forsetijudge.api.adapter.driving.http.controller.contests

import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildAdminDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildContestantDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildGuestDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildJudgeDashboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.dashboard.BuildStaffDashboardUseCase
import com.forsetijudge.core.port.dto.response.dashboard.AdminDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.ContestantDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.GuestDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.JudgeDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.StaffDashboardResponseBodyDTO
import com.forsetijudge.core.port.dto.response.dashboard.toResponseBodyDTO
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class ContestDashboardController(
    private val buildAdminDashboardUseCase: BuildAdminDashboardUseCase,
    private val buildContestantDashboardUseCase: BuildContestantDashboardUseCase,
    private val buildGuestDashboardUseCase: BuildGuestDashboardUseCase,
    private val buildJudgeDashboardUseCase: BuildJudgeDashboardUseCase,
    private val buildStaffDashboardUseCase: BuildStaffDashboardUseCase,
) {
    private val logger = SafeLogger(this::class)

    @GetMapping("/contests/{contestId}/dashboard/admin")
    @Private(Member.Type.ROOT, Member.Type.ADMIN)
    fun getAdminDashboard(
        @PathVariable contestId: UUID,
    ): ResponseEntity<AdminDashboardResponseBodyDTO> {
        logger.info("[GET] /v1/contests/$contestId/dashboard/admin")
        val dashboard = buildAdminDashboardUseCase.execute()
        return ResponseEntity.ok(dashboard.toResponseBodyDTO())
    }

    @GetMapping("/contests/{contestId}/dashboard/contestant")
    @Private(Member.Type.CONTESTANT)
    fun getContestantDashboard(
        @PathVariable contestId: UUID,
    ): ResponseEntity<ContestantDashboardResponseBodyDTO> {
        logger.info("[GET] /v1/contests/$contestId/dashboard/contestant")
        val dashboard = buildContestantDashboardUseCase.execute()
        return ResponseEntity.ok(dashboard.toResponseBodyDTO())
    }

    @GetMapping("/contests/{contestId}/dashboard/guest")
    fun getGuestDashboard(
        @PathVariable contestId: UUID,
    ): ResponseEntity<GuestDashboardResponseBodyDTO> {
        logger.info("[GET] /v1/contests/$contestId/dashboard/guest")
        val dashboard = buildGuestDashboardUseCase.execute()
        return ResponseEntity.ok(dashboard.toResponseBodyDTO())
    }

    @GetMapping("/contests/{contestId}/dashboard/judge")
    @Private(Member.Type.JUDGE)
    fun getJudgeDashboard(
        @PathVariable contestId: UUID,
    ): ResponseEntity<JudgeDashboardResponseBodyDTO> {
        logger.info("[GET] /v1/contests/$contestId/dashboard/judge")
        val dashboard = buildJudgeDashboardUseCase.execute()
        return ResponseEntity.ok(dashboard.toResponseBodyDTO())
    }

    @GetMapping("/contests/{contestId}/dashboard/staff")
    @Private(Member.Type.STAFF)
    fun getStaffDashboard(
        @PathVariable contestId: UUID,
    ): ResponseEntity<StaffDashboardResponseBodyDTO> {
        logger.info("[GET] /v1/contests/$contestId/dashboard/staff")
        val dashboard = buildStaffDashboardUseCase.execute()
        return ResponseEntity.ok(dashboard.toResponseBodyDTO())
    }
}
