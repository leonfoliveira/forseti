package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.service.authorization.AuthorizationService
import io.github.leonfoliveira.judge.common.service.dto.input.authorization.AuthenticateInputDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/auth")
class AuthenticationController(
    val authorizationService: AuthorizationService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/sign-in")
    @Transactional(readOnly = true)
    fun authenticate(
        @RequestBody body: AuthenticateInputDTO,
    ): ResponseEntity<Authorization> {
        logger.info("[POST] /v1/auth/sign-in - body: $body")
        val authorization = authorizationService.authenticate(body)
        return ResponseEntity.ok(authorization)
    }

    @PostMapping("/contests/{id}/sign-in")
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
        return ResponseEntity.ok(authorization)
    }
}
