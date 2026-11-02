package com.forsetijudge.core.api.http.sse

import com.forsetijudge.core.api.util.RequiresEntitlement
import com.forsetijudge.core.domain.model.Entitlement
import com.forsetijudge.core.util.SafeLogger
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
    @RequiresEntitlement(Entitlement.DASHBOARD_ADMIN_READ)
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

    @GetMapping("/sse/contests/{contestId}/dashboard/staff")
    @RequiresEntitlement(Entitlement.DASHBOARD_STAFF_READ)
    fun subscribeToStaffDashboardRoom(
        @PathVariable contestId: UUID,
        @RequestHeader(value = "Last-Event-ID", required = false) lastEventId: String?,
    ): SseEmitter {
        logger.info("[GET] /v1/sse/contests/$contestId/dashboard/staff")
        sseAuthorizer.authorizeToStaffDashboardRoom(contestId)
        val emitter = SseEmitter(Long.MAX_VALUE)
        val room = SSERoomBuilder.buildStaffDashboardRoom(contestId)
        sseHelper.subscribe(room, emitter)
        if (lastEventId != null) {
            sseHelper.emitMissedMessages(room, lastEventId, emitter)
        }
        return emitter
    }

    @GetMapping("/sse/contests/{contestId}/dashboard/judge")
    @RequiresEntitlement(Entitlement.DASHBOARD_JUDGE_READ)
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

    @GetMapping("/sse/contests/{contestId}/dashboard/contestant")
    @RequiresEntitlement(Entitlement.DASHBOARD_CONTESTANT_READ)
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

    @GetMapping("/sse/contests/{contestId}/dashboard/spectator")
    fun subscribeToSpectatorDashboardRoom(
        @PathVariable contestId: UUID,
        @RequestHeader(value = "Last-Event-ID", required = false) lastEventId: String?,
    ): SseEmitter {
        logger.info("[GET] /v1/sse/contests/$contestId/dashboard/spectator")
        sseAuthorizer.authorizeToSpectatorDashboardRoom(contestId)
        val emitter = SseEmitter(Long.MAX_VALUE)
        val room = SSERoomBuilder.buildSpectatorDashboardRoom(contestId)
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
