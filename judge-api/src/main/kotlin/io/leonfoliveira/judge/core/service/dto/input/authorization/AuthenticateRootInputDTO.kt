package io.leonfoliveira.judge.core.service.dto.input.authorization

data class AuthenticateRootInputDTO(
    val password: String,
) {
    override fun toString(): String {
        return "AuthenticateRootInputDTO(password='******')"
    }
}
