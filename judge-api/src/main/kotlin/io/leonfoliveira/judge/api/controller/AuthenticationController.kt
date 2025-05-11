package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.core.entity.model.Authorization
import io.leonfoliveira.judge.core.service.authorization.AuthorizationService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1")
class AuthenticationController(
    val authenticationService: AuthorizationService,
) {
    data class RootLoginRequestBody(
        val password: String
    )

    @PostMapping("/root/auth")
    fun authenticateRoot(@RequestBody request: RootLoginRequestBody): ResponseEntity<Authorization> {
        val authorization = authenticationService.authenticateRoot(request.password)
        return ResponseEntity.ok(authorization)
    }

    data class ContestLoginRequestBody(
        val login: String,
        val password: String
    )

    @PostMapping("/contest/{contestId}/auth")
    fun authenticateRoot(@RequestBody request: ContestLoginRequestBody): ResponseEntity<Authorization> {
        val authorization = authenticationService.authenticateMember(
            request.login,
            request.password
        )
        return ResponseEntity.ok(authorization)
    }
}