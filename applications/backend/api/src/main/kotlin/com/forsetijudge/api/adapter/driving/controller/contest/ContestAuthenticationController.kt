package com.forsetijudge.api.adapter.driving.controller.contest

import com.forsetijudge.api.adapter.dto.request.authentication.AuthenticateToContestRequestBodyDTO
import com.forsetijudge.api.adapter.util.cookie.CsrfCookieBuilder
import com.forsetijudge.api.adapter.util.cookie.SessionCookieBuilder
import com.forsetijudge.core.port.driving.usecase.external.authentication.SignInUseCase
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1")
class ContestAuthenticationController(
    private val signInUseCase: SignInUseCase,
    private val sessionCookieBuilder: SessionCookieBuilder,
    private val csrfCookieBuilder: CsrfCookieBuilder,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/contests/{contestId}:sign-in")
    fun authenticate(
        @PathVariable contestId: UUID,
        @RequestBody body: AuthenticateToContestRequestBodyDTO,
    ): ResponseEntity<SessionResponseBodyDTO> {
        logger.info("[POST] /api/v1/contests/{}:sign-in", contestId)
        val session =
            signInUseCase.execute(
                SignInUseCase.Command(
                    login = body.login,
                    password = body.password,
                ),
            )

        val sessionCookie = sessionCookieBuilder.buildCookie(session.toResponseBodyDTO())
        val csrfCookie = csrfCookieBuilder.buildCookie(session.toResponseBodyDTO())

        return ResponseEntity
            .ok()
            .header(HttpHeaders.SET_COOKIE, sessionCookie, csrfCookie)
            .body(session.toResponseBodyDTO())
    }
}
