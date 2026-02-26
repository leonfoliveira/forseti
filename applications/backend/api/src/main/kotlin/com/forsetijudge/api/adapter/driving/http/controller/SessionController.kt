package com.forsetijudge.api.adapter.driving.http.controller

import com.forsetijudge.api.adapter.util.cookie.CsrfCookieBuilder
import com.forsetijudge.api.adapter.util.cookie.SessionCookieBuilder
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.session.DeleteAllSessionsByMemberUseCase
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
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
        return ResponseEntity.ok(session.toResponseBodyDTO())
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
