package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.api.controller.dto.request.AuthenticateMemberRequestDTO
import io.leonfoliveira.judge.api.controller.dto.request.AuthenticateRootRequestDTO
import io.leonfoliveira.judge.core.service.authorization.AuthorizationService
import io.leonfoliveira.judge.core.domain.model.Authorization
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
        @RequestBody request: AuthenticateRootRequestDTO,
    ): ResponseEntity<Authorization> {
        val authorization = authenticationService.authenticateRoot(request.password)
        return ResponseEntity.ok(authorization)
    }

    @PostMapping("/contests/{id}")
    fun authenticateMember(
        @PathVariable id: Int,
        @RequestBody request: AuthenticateMemberRequestDTO,
    ): ResponseEntity<Authorization> {
        val authorization =
            authenticationService.authenticateMember(
                contestId = id,
                request.login,
                request.password,
            )
        return ResponseEntity.ok(authorization)
    }
}
