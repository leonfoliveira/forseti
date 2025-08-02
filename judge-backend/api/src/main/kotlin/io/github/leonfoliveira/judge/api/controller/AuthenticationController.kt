package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.dto.response.AuthorizationResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.toResponseDTO
import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.service.authorization.AuthorizationService
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.AuthenticateInputDTO
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
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

    @PostMapping("/sign-in")
    @Transactional(readOnly = true)
    fun authenticate(
        @RequestBody body: AuthenticateInputDTO,
    ): ResponseEntity<AuthorizationResponseDTO> {
        logger.info("[POST] /v1/auth/sign-in - body: $body")
        val authorization = authorizationService.authenticate(body)
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, buildCookie(authorization).toString())
            .body(authorization.toResponseDTO())
    }

    @PostMapping("/contests/{id}/sign-in")
    @Transactional(readOnly = true)
    fun authenticateForContest(
        @PathVariable id: UUID,
        @RequestBody body: AuthenticateInputDTO,
    ): ResponseEntity<AuthorizationResponseDTO> {
        logger.info("[POST] /v1/auth/contests/{id}/sign-in - id: $id, body: $body")
        val authorization =
            authorizationService.authenticateForContest(
                contestId = id,
                body,
            )
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, buildCookie(authorization).toString())
            .body(authorization.toResponseDTO())
    }

    private fun buildCookie(authorization: Authorization): ResponseCookie {
        return ResponseCookie.from("access_token", authorization.accessToken)
            .httpOnly(true)
            .secure(true)
            .path("/")
            .maxAge(Duration.between(OffsetDateTime.now(), authorization.expiresAt))
            .sameSite("Lax")
            .build()
    }
}
