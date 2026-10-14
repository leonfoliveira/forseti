package com.forsetijudge.core.api.http.sse

import com.forsetijudge.core.util.SafeLogger
import java.util.UUID
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class SSEController {
    private val logger = SafeLogger(this::class)

    @GetMapping("/sse/contests/{contestId}/dashboard/admin")
    @PreAuthorize("hasAnyRole('ROOT', 'ADMIN')")
    fun subscribeToAdminDashboardRoom(
        @PathVariable contestId: UUID,
    ): SseEmitter {
        logger.info("[GET] /v1/sse/contests/$contestId/dashboard/admin")
        val emitter = SseEmitter(Long.MAX_VALUE)
        SSEHelper.subscribe(SSERoomBuilder.buildAdminDashboardRoom(contestId), emitter)
        return emitter
    }

    @GetMapping("/sse/contests/{contestId}/dashboard/contestant")
    @PreAuthorize("hasRole('CONTESTANT')")
    fun subscribeToContestantDashboardRoom(
        @PathVariable contestId: UUID,
    ): SseEmitter {
        logger.info("[GET] /v1/sse/contests/$contestId/dashboard/contestant")
        val emitter = SseEmitter(Long.MAX_VALUE)
        SSEHelper.subscribe(SSERoomBuilder.buildContestantDashboardRoom(contestId), emitter)
        return emitter
    }

    @GetMapping("/sse/contests/{contestId}/dashboard/judge")
    @PreAuthorize("hasRole('JUDGE')")
    fun subscribeToJudgeDashboardRoom(
        @PathVariable contestId: UUID,
    ): SseEmitter {
        logger.info("[GET] /v1/sse/contests/$contestId/dashboard/judge")
        val emitter = SseEmitter(Long.MAX_VALUE)
        SSEHelper.subscribe(SSERoomBuilder.buildJudgeDashboardRoom(contestId), emitter)
        return emitter
    }

    @GetMapping("/sse/contests/{contestId}/dashboard/guest")
    fun subscribeToGuestDashboardRoom(
        @PathVariable contestId: UUID,
    ): SseEmitter {
        logger.info("[GET] /v1/sse/contests/$contestId/dashboard/guest")
        val emitter = SseEmitter(Long.MAX_VALUE)
        SSEHelper.subscribe(SSERoomBuilder.buildGuestDashboardRoom(contestId), emitter)
        return emitter
    }

    @GetMapping("/sse/members/{memberId}")
    fun subscribeToMemberPrivateRoom(
        @PathVariable memberId: UUID,
    ): SseEmitter {
        logger.info("[GET] /v1/sse/members/$memberId")
        val emitter = SseEmitter(Long.MAX_VALUE)
        SSEHelper.subscribe(SSERoomBuilder.buildMemberPrivateRoom(memberId), emitter)
        return emitter
    }
}
