package io.github.leonfoliveira.judge.core.service.dto.input.authorization

data class AuthenticateInputDTO(
    val login: String,
    val password: String,
) {
    override fun toString(): String {
        return "AuthenticateInputDTO(login='******', password='******')"
    }
}
