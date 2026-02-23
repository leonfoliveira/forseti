package com.forsetijudge.api.adapter.driving.controller.root

import com.forsetijudge.api.adapter.dto.request.authentication.AuthenticateRootRequestBodyDTO
import com.forsetijudge.api.adapter.util.cookie.CsrfCookieBuilder
import com.forsetijudge.api.adapter.util.cookie.SessionCookieBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.authentication.SignInUseCase
import com.forsetijudge.core.port.dto.response.dashboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class RootAuthenticationController(
    private val signInUseCase: SignInUseCase,
    private val sessionCookieBuilder: SessionCookieBuilder,
    private val csrfCookieBuilder: CsrfCookieBuilder,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/root:sign-in")
    fun authenticateRoot(
        @RequestBody body: AuthenticateRootRequestBodyDTO,
    ): ResponseEntity<SessionResponseBodyDTO> {
        logger.info("[POST] /v1/root:sign-in {}", body)
        val session =
            signInUseCase.execute(
                SignInUseCase.Command(
                    login = Member.ROOT_LOGIN,
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
