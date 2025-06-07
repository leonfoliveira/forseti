package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.core.domain.model.Authorization
import io.leonfoliveira.judge.core.service.authorization.AuthorizationService
import io.leonfoliveira.judge.core.service.dto.input.AuthenticateMemberInputDTO
import io.leonfoliveira.judge.core.service.dto.input.AuthenticateRootInputDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/auth")
class AuthenticationController(
    val authenticationService: AuthorizationService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/root")
    fun authenticateRoot(
        @RequestBody body: AuthenticateRootInputDTO,
    ): ResponseEntity<Authorization> {
        logger.info("[POST] /v1/auth/root - body: $body")
        val authorization = authenticationService.authenticateRoot(body)
        return ResponseEntity.ok(authorization)
    }

    @PostMapping("/contests/{id}")
    fun authenticateMember(
        @PathVariable id: UUID,
        @RequestBody body: AuthenticateMemberInputDTO,
    ): ResponseEntity<Authorization> {
        logger.info("[POST] /v1/auth/contests/{id} - id: $id, body: $body")
        val authorization =
            authenticationService.authenticateMember(
                contestId = id,
                body,
            )
        return ResponseEntity.ok(authorization)
    }
}
