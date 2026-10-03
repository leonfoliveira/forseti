package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.api.http.dto.request.authentication.AuthenticateRootRequestBodyDTO
import com.forsetijudge.core.api.http.dto.request.authentication.AuthenticateToContestRequestBodyDTO
import com.forsetijudge.core.api.util.CsrfCookieBuilder
import com.forsetijudge.core.api.util.SessionCookieBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.Session
import com.forsetijudge.core.port.input.usecase.authentication.SignInUseCase
import com.forsetijudge.core.util.SafeLogger
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
class AuthenticationController(
    private val signInUseCase: SignInUseCase,
    private val sessionCookieBuilder: SessionCookieBuilder,
    private val csrfCookieBuilder: CsrfCookieBuilder,
) {
    private val logger = SafeLogger(this::class)

    @PostMapping("/root:sign-in")
    fun authenticateRoot(
        @RequestBody body: AuthenticateRootRequestBodyDTO,
    ): ResponseEntity<Session> {
        logger.info("[POST] /v1/root:sign-in")
        val session =
            signInUseCase.execute(
                SignInUseCase.Command(
                    contestId = null,
                    login = Member.ROOT_LOGIN,
                    password = body.password,
                ),
            )

        val sessionCookie = sessionCookieBuilder.buildCookie(session)
        val csrfCookie = csrfCookieBuilder.buildCookie(session)

        return ResponseEntity
            .ok()
            .header(HttpHeaders.SET_COOKIE, sessionCookie, csrfCookie)
            .body(session)
    }

    @PostMapping("/contests/{contestId}:sign-in")
    fun authenticateToContest(
        @PathVariable contestId: UUID,
        @RequestBody body: AuthenticateToContestRequestBodyDTO,
    ): ResponseEntity<Session> {
        logger.info("[POST] /v1/contests/$contestId:sign-in")
        val session =
            signInUseCase.execute(
                SignInUseCase.Command(
                    contestId = contestId,
                    login = body.login,
                    password = body.password,
                ),
            )

        val sessionCookie = sessionCookieBuilder.buildCookie(session)
        val csrfCookie = csrfCookieBuilder.buildCookie(session)

        return ResponseEntity
            .ok()
            .header(HttpHeaders.SET_COOKIE, sessionCookie, csrfCookie)
            .body(session)
    }
}
