package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.api.util.CsrfCookieBuilder
import com.forsetijudge.core.api.util.SessionCookieBuilder
import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.session.DeleteAllSessionsByContextMemberUseCase
import com.forsetijudge.core.util.SafeLogger
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
    private val deleteAllSessionsByContextMemberUseCase: DeleteAllSessionsByContextMemberUseCase,
    private val sessionCookieBuilder: SessionCookieBuilder,
    private val csrfCookieBuilder: CsrfCookieBuilder,
) {
    private val logger = SafeLogger(this::class)

    @GetMapping("/sessions/me")
    fun getSession(): ResponseEntity<SessionResponseBodyDTO> {
        logger.info("[GET] /v1/sessions/me")
        val session = AuthenticationHelper.getCurrentSession()
        return ResponseEntity.ok(session)
    }

    @DeleteMapping("/sessions/me")
    fun deleteSession(): ResponseEntity<Void> {
        logger.info("[DELETE] /v1/sessions/me")
        deleteAllSessionsByContextMemberUseCase.execute()
        val sessionCookie = sessionCookieBuilder.buildCleanCookie()
        val csrfCookie = csrfCookieBuilder.buildCleanCookie()
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, sessionCookie, csrfCookie).build()
    }
}
