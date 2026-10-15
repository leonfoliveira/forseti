package com.forsetijudge.core.api.http.sse

import com.forsetijudge.core.util.SafeLogger
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.UUID

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class SSEController(
    private val sseAuthorizer: SSEAuthorizer,
    private val sseHelper: SSEHelper,
) {
    private val logger = SafeLogger(this::class)

    @GetMapping("/sse/contests/{contestId}/dashboard/admin")
    @PreAuthorize("hasAnyRole('ROOT', 'ADMIN')")
    fun subscribeToAdminDashboardRoom(
        @PathVariable contestId: UUID,
        @RequestHeader(value = "Last-Event-ID", required = false) lastEventId: String?,
    ): SseEmitter {
        logger.info("[GET] /v1/sse/contests/$contestId/dashboard/admin")
        sseAuthorizer.authorizeToAdminDashboardRoom(contestId)
        val emitter = SseEmitter(Long.MAX_VALUE)
        val room = SSERoomBuilder.buildAdminDashboardRoom(contestId)
        sseHelper.subscribe(room, emitter)
        if (lastEventId != null) {
            sseHelper.emitMissedMessages(room, lastEventId, emitter)
        }
        return emitter
    }

    @GetMapping("/sse/contests/{contestId}/dashboard/contestant")
    @PreAuthorize("hasRole('CONTESTANT')")
    fun subscribeToContestantDashboardRoom(
        @PathVariable contestId: UUID,
        @RequestHeader(value = "Last-Event-ID", required = false) lastEventId: String?,
    ): SseEmitter {
        logger.info("[GET] /v1/sse/contests/$contestId/dashboard/contestant (lastEventId=$lastEventId)")
        sseAuthorizer.authorizeToContestantDashboardRoom(contestId)
        val emitter = SseEmitter(Long.MAX_VALUE)
        val room = SSERoomBuilder.buildContestantDashboardRoom(contestId)
        sseHelper.subscribe(room, emitter)
        if (lastEventId != null) {
            sseHelper.emitMissedMessages(room, lastEventId, emitter)
        }
        return emitter
    }

    @GetMapping("/sse/contests/{contestId}/dashboard/judge")
    @PreAuthorize("hasRole('JUDGE')")
    fun subscribeToJudgeDashboardRoom(
        @PathVariable contestId: UUID,
        @RequestHeader(value = "Last-Event-ID", required = false) lastEventId: String?,
    ): SseEmitter {
        logger.info("[GET] /v1/sse/contests/$contestId/dashboard/judge")
        sseAuthorizer.authorizeToJudgeDashboardRoom(contestId)
        val emitter = SseEmitter(Long.MAX_VALUE)
        val room = SSERoomBuilder.buildJudgeDashboardRoom(contestId)
        sseHelper.subscribe(room, emitter)
        if (lastEventId != null) {
            sseHelper.emitMissedMessages(room, lastEventId, emitter)
        }
        return emitter
    }

    @GetMapping("/sse/contests/{contestId}/dashboard/guest")
    fun subscribeToGuestDashboardRoom(
        @PathVariable contestId: UUID,
        @RequestHeader(value = "Last-Event-ID", required = false) lastEventId: String?,
    ): SseEmitter {
        logger.info("[GET] /v1/sse/contests/$contestId/dashboard/guest")
        sseAuthorizer.authorizeToGuestDashboardRoom(contestId)
        val emitter = SseEmitter(Long.MAX_VALUE)
        val room = SSERoomBuilder.buildGuestDashboardRoom(contestId)
        sseHelper.subscribe(room, emitter)
        if (lastEventId != null) {
            sseHelper.emitMissedMessages(room, lastEventId, emitter)
        }
        return emitter
    }

    @GetMapping("/sse/members/{memberId}")
    fun subscribeToMemberPrivateRoom(
        @PathVariable memberId: UUID,
        @RequestHeader(value = "Last-Event-ID", required = false) lastEventId: String?,
    ): SseEmitter {
        logger.info("[GET] /v1/sse/members/$memberId")
        sseAuthorizer.authorizeToMemberPrivateRoom(memberId)
        val emitter = SseEmitter(Long.MAX_VALUE)
        val room = SSERoomBuilder.buildMemberPrivateRoom(memberId)
        sseHelper.subscribe(room, emitter)
        if (lastEventId != null) {
            sseHelper.emitMissedMessages(room, lastEventId, emitter)
        }
        return emitter
    }
}
