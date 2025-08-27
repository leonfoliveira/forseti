package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.github.leonfoliveira.judge.common.domain.exception.UnauthorizedException
import io.github.leonfoliveira.judge.api.util.KeyType
import io.github.leonfoliveira.judge.api.util.RateLimit
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.service.authorization.AuthorizationService
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.AuthenticateInputDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Duration
import java.time.OffsetDateTime

@RestController
@RequestMapping("/v1/auth")
class AuthenticationController(
    val authorizationService: AuthorizationService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping("/me")
    @Operation(
        summary = "Get current authorization",
        description = "Returns the authorization of the current user.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Authorization retrieved successfully",
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    fun getAuthorization(): ResponseEntity<Authorization> {
        logger.info("[GET] /v1/auth/me")
        val authorization = AuthorizationContextUtil.get()
        if (authorization == null) {
            throw UnauthorizedException()
        }
        return ResponseEntity.ok(authorization)
    }

    @PostMapping("/sign-in")
    @RateLimit(
        requestsPerMinute = 5,  // Apenas 5 tentativas de login por minuto
        requestsPerHour = 20,   // 20 tentativas por hora
        burstCapacity = 2,      // Máximo 2 tentativas em sequência rápida
        keyType = KeyType.IP_ADDRESS
    )
    @Operation(
        summary = "Authenticate",
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
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    @Transactional(readOnly = true)
    fun authenticate(
        @RequestBody body: AuthenticateInputDTO,
    ): ResponseEntity<Authorization> {
        logger.info("[POST] /v1/auth/sign-in $body")
        val authorization = authorizationService.authenticate(body)
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, buildCookie(authorization).toString())
            .body(authorization)
    }

    private fun buildCookie(authorization: Authorization): ResponseCookie {
        val accessToken = authorizationService.encodeToken(authorization)
        return ResponseCookie.from("access_token", accessToken)
            .httpOnly(true)
            .secure(true)
            .path("/")
            .maxAge(Duration.between(OffsetDateTime.now(), authorization.expiresAt))
            .sameSite("Lax")
            .build()
    }
}
