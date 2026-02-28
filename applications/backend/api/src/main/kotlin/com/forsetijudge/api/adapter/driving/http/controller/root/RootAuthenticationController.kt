package com.forsetijudge.api.adapter.driving.http.controller.root

import com.forsetijudge.api.adapter.dto.request.authentication.AuthenticateRootRequestBodyDTO
import com.forsetijudge.api.adapter.util.cookie.CsrfCookieBuilder
import com.forsetijudge.api.adapter.util.cookie.SessionCookieBuilder
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.authentication.SignInUseCase
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class RootAuthenticationController(
    private val signInUseCase: SignInUseCase,
    private val sessionCookieBuilder: SessionCookieBuilder,
    private val csrfCookieBuilder: CsrfCookieBuilder,
) {
    private val logger = SafeLogger(this::class)

    @PostMapping("/root:sign-in")
    fun authenticateRoot(
        @RequestBody body: AuthenticateRootRequestBodyDTO,
    ): ResponseEntity<SessionResponseBodyDTO> {
        logger.info("[POST] /v1/root:sign-in")
        val session =
            signInUseCase.execute(
                SignInUseCase.Command(
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
}
