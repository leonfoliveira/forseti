package io.github.leonfoliveira.forseti.api.adapter.driving.controller

import io.github.leonfoliveira.forseti.api.adapter.dto.request.NoLoginAuthenticateRequestDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.session.SessionResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.session.toResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.util.SessionCookieUtil
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import live.forseti.core.domain.entity.Member
import live.forseti.core.port.driving.usecase.authentication.AuthenticateUseCase
import live.forseti.core.port.dto.input.authorization.AuthenticateInputDTO
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/root")
class RootController(
    val authenticateUseCase: AuthenticateUseCase,
    val sessionCookieUtil: SessionCookieUtil,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/sign-in")
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
        logger.info("[POST] /v1/root/sign-in $body")
        val session =
            authenticateUseCase.authenticate(
                AuthenticateInputDTO(
                    login = Member.ROOT_LOGIN,
                    password = body.password,
                ),
            )
        val cookie = sessionCookieUtil.buildCookie(session)
        return ResponseEntity
            .ok()
            .header(HttpHeaders.SET_COOKIE, cookie)
            .body(session.toResponseDTO())
    }
}
