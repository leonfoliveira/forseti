package io.github.leonfoliveira.judge.api.controller.root

import io.github.leonfoliveira.judge.api.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.judge.api.service.AuthorizationCookieService
import io.github.leonfoliveira.judge.api.util.RateLimit
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.service.authorization.AuthorizationService
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.RootAuthenticateInputDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/root")
class RootAuthenticationController(
    val authorizationService: AuthorizationService,
    val authorizationCookieService: AuthorizationCookieService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/sign-in")
    @RateLimit
    @Operation(
        summary = "Sign in as root user",
        description = "Authenticates a user and returns an authorization.",
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
    @Transactional(readOnly = true)
    fun authenticate(
        @RequestBody body: RootAuthenticateInputDTO,
    ): ResponseEntity<Authorization> {
        logger.info("[POST] /v1/root/sign-in $body")
        val authorization = authorizationService.authenticateRoot(body)
        val cookie = authorizationCookieService.buildCookie(authorization)
        return ResponseEntity
            .ok()
            .header(HttpHeaders.SET_COOKIE, cookie)
            .body(authorization)
    }
}
