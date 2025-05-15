package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.core.service.authorization.AuthorizationService
import io.leonfoliveira.judge.core.service.dto.output.AuthorizationOutputDTO
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
    data class RootLoginRequestBody(
        val password: String,
    )

    @PostMapping("/root")
    fun authenticateRoot(
        @RequestBody request: RootLoginRequestBody,
    ): ResponseEntity<AuthorizationOutputDTO> {
        val authorization = authenticationService.authenticateRoot(request.password)
        return ResponseEntity.ok(authorization)
    }

    data class MemberLoginRequestBody(
        val login: String,
        val password: String,
    )

    @PostMapping("/contests/{id}")
    fun authenticateMember(
        @PathVariable id: Int,
        @RequestBody request: MemberLoginRequestBody,
    ): ResponseEntity<AuthorizationOutputDTO> {
        val authorization =
            authenticationService.authenticateMember(
                contestId = id,
                request.login,
                request.password,
            )
        return ResponseEntity.ok(authorization)
    }
}
