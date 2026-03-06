package com.forsetijudge.api.adapter.driving.http.controller

import com.forsetijudge.api.adapter.util.cookie.CsrfCookieBuilder
import com.forsetijudge.api.adapter.util.cookie.SessionCookieBuilder
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.session.DeleteAllSessionsByMemberUseCase
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class SessionController(
    private val deleteAllSessionsByMemberUseCase: DeleteAllSessionsByMemberUseCase,
    private val sessionCookieBuilder: SessionCookieBuilder,
    private val csrfCookieBuilder: CsrfCookieBuilder,
) {
    private val logger = SafeLogger(this::class)

    @GetMapping("/sessions/me")
    fun getSession(): ResponseEntity<SessionResponseBodyDTO> {
        logger.info("[GET] /v1/sessions/me")
        val session = ExecutionContext.getSession()
        return ResponseEntity.ok(session)
    }

    @GetMapping("/sessions/grafana")
    fun getGrafanaCredentials(): ResponseEntity<Map<String, Boolean>> {
        logger.info("[GET] /v1/sessions/grafana")
        val member = ExecutionContext.getMemberNullable()

        if (member != null && member.type in setOf(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF)) {
            val user = if (member.contestSlug != null) "${member.login}@${member.contestSlug}" else member.login
            logger.info("Providing Grafana credentials for user '$user' with name '${member.name}'")
            return ResponseEntity
                .ok()
                .header("x-webauth-user", user)
                .header("x-webauth-name", member.name)
                .body(mapOf("ok" to true))
        }

        logger.info("No Grafana credentials provided for unauthenticated user or user with insufficient permissions")
        /**
         * Although contrary to REST principles, we need to return 200 OK so Traefik continues to forward the request to Grafana,
         * which will then return 401 Unauthorized and show the default login page as fallback.
         * This allows users to sign in on Grafana without needing to sign in on a contest dashboard first.
         */
        return ResponseEntity.ok().body(mapOf("ok" to false))
    }

    @DeleteMapping("/sessions/me")
    fun deleteSession(): ResponseEntity<Void> {
        logger.info("[DELETE] /v1/sessions/me")
        deleteAllSessionsByMemberUseCase.execute()
        val sessionCookie = sessionCookieBuilder.buildCleanCookie()
        val csrfCookie = csrfCookieBuilder.buildCleanCookie()
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, sessionCookie, csrfCookie).build()
    }
}
