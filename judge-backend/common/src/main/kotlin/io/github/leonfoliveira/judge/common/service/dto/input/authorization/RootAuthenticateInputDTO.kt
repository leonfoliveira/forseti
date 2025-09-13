package io.github.leonfoliveira.judge.common.service.dto.input.authorization

data class RootAuthenticateInputDTO(
    val password: String,
) {
    override fun toString(): String = "RootAuthenticateInputDTO(password='******')"
}
