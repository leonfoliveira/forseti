package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.core.domain.model.Authorization
import io.leonfoliveira.judge.core.service.authorization.AuthorizationService
import io.leonfoliveira.judge.core.service.dto.input.AuthenticateMemberInputDTO
import io.leonfoliveira.judge.core.service.dto.input.AuthenticateRootInputDTO
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/auth")
class AuthorizationController(
    val authenticationService: AuthorizationService,
) {
    @PostMapping("/root")
    fun authenticateRoot(
        @RequestBody body: AuthenticateRootInputDTO,
    ): ResponseEntity<Authorization> {
        val authorization = authenticationService.authenticateRoot(body)
        return ResponseEntity.ok(authorization)
    }

    @PostMapping("/contests/{id}")
    fun authenticateMember(
        @PathVariable id: Int,
        @RequestBody body: AuthenticateMemberInputDTO,
    ): ResponseEntity<Authorization> {
        val authorization =
            authenticationService.authenticateMember(
                contestId = id,
                body,
            )
        return ResponseEntity.ok(authorization)
    }
}
