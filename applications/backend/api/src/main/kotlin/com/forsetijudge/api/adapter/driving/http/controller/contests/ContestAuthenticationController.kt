package com.forsetijudge.api.adapter.driving.http.controller.contests

import com.forsetijudge.api.adapter.dto.request.authentication.AuthenticateToContestRequestBodyDTO
import com.forsetijudge.api.adapter.util.cookie.CsrfCookieBuilder
import com.forsetijudge.api.adapter.util.cookie.SessionCookieBuilder
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.port.driving.usecase.external.authentication.SignInUseCase
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class ContestAuthenticationController(
    private val signInUseCase: SignInUseCase,
    private val sessionCookieBuilder: SessionCookieBuilder,
    private val csrfCookieBuilder: CsrfCookieBuilder,
) {
    private val logger = SafeLogger(this::class)

    @PostMapping("/contests/{contestId}:sign-in")
    fun authenticate(
        @PathVariable contestId: UUID,
        @RequestBody body: AuthenticateToContestRequestBodyDTO,
    ): ResponseEntity<SessionResponseBodyDTO> {
        logger.info("[POST] /v1/contests/$contestId:sign-in")
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
