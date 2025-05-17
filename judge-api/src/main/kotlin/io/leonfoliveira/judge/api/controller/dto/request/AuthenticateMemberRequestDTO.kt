package io.leonfoliveira.judge.api.controller.dto.request

data class AuthenticateMemberRequestDTO(
    val login: String,
    val password: String,
)