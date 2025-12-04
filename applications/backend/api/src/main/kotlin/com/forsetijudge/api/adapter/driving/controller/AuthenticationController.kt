package com.forsetijudge.api.adapter.driving.controller

import com.forsetijudge.api.adapter.dto.request.NoLoginAuthenticateRequestDTO
import com.forsetijudge.api.adapter.dto.response.ErrorResponseDTO
import com.forsetijudge.api.adapter.dto.response.session.SessionResponseDTO
import com.forsetijudge.api.adapter.dto.response.session.toResponseDTO
import com.forsetijudge.api.adapter.util.cookie.CsrfCookieBuilder
import com.forsetijudge.api.adapter.util.cookie.SessionCookieBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.authentication.AuthenticateUseCase
import com.forsetijudge.core.port.dto.input.authorization.AuthenticateInputDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class AuthenticationController(
    val authenticateUseCase: AuthenticateUseCase,
    val sessionCookieBuilder: SessionCookieBuilder,
    val csrfCookieBuilder: CsrfCookieBuilder,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/auth:sign-in-as-root")
    @Operation(
        summary = "Sign in as root",
        description = "Authenticates a root user.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Authenticated successfully",
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponseDTO::class),
                    ),
                ],
            ),
        ],
    )
    fun authenticateRoot(
        @RequestBody body: NoLoginAuthenticateRequestDTO,
    ): ResponseEntity<SessionResponseDTO> {
        logger.info("[POST] /v1/auth:sign-in-as-root $body")
        val session =
            authenticateUseCase.authenticate(
                AuthenticateInputDTO(
                    login = Member.ROOT_LOGIN,
                    password = body.password,
                ),
            )

        val sessionCookie = sessionCookieBuilder.buildCookie(session)
        val csrfCookie = csrfCookieBuilder.buildCookie(session)

        return ResponseEntity
            .ok()
            .header(HttpHeaders.SET_COOKIE, sessionCookie, csrfCookie)
            .body(session.toResponseDTO())
    }
}
