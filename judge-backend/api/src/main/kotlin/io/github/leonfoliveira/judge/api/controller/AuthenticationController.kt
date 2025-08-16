package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.judge.api.util.AuthorizationContextUtil
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.service.authorization.AuthorizationService
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.AuthenticateInputDTO
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Duration
import java.time.OffsetDateTime
import java.util.UUID

@RestController
@RequestMapping("/v1/auth")
class AuthenticationController(
    val authorizationService: AuthorizationService,
    @Value("\${security.jwt.expiration}")
    private val expiration: String,
    @Value("\${security.jwt.root-expiration}")
    private val rootExpiration: String,
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
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))]
            ),
        ],
    )
    fun getAuthorization(): ResponseEntity<Authorization> {
        logger.info("[GET] /v1/auth/me")
        val authorization = AuthorizationContextUtil.get()
        return ResponseEntity.ok(authorization)
    }

    @DeleteMapping("/me")
    @Operation(
        summary = "Clean authorization",
        description = "Cleans the authorization of the current user.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "204",
                description = "Authorization cleaned successfully",
            ),
        ],
    )
    fun cleanAuthorization(): ResponseEntity<Void> {
        logger.info("[DELETE] /v1/auth/me")
        return ResponseEntity.noContent()
            .header(
                HttpHeaders.SET_COOKIE,
                ResponseCookie.from("access_token", "")
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(0)
                    .sameSite("Lax")
                    .build()
                    .toString(),
            )
            .build()
    }

    @PostMapping("/sign-in")
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
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))]
            ),
        ],
    )
    @Transactional(readOnly = true)
    fun authenticate(
        @RequestBody body: AuthenticateInputDTO,
    ): ResponseEntity<Authorization> {
        logger.info("[POST] /v1/auth/sign-in - body: $body")
        val authorization = authorizationService.authenticate(body)
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, buildCookie(authorization).toString())
            .body(authorization)
    }

    @PostMapping("/contests/{id}/sign-in")
    @Operation(
        summary = "Authenticate for a contest",
        description = "Authenticates a user for a contest and returns an authorization.",
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
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))]
            ),
            ApiResponse(
                responseCode = "404",
                description = "Contest not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))]
            ),
        ],
    )
    @Transactional(readOnly = true)
    fun authenticateForContest(
        @PathVariable id: UUID,
        @RequestBody body: AuthenticateInputDTO,
    ): ResponseEntity<Authorization> {
        logger.info("[POST] /v1/auth/contests/{id}/sign-in - id: $id, body: $body")
        val authorization =
            authorizationService.authenticateForContest(
                contestId = id,
                body,
            )
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
