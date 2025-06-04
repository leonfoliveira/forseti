package io.leonfoliveira.judge.core.service.dto.input

data class AuthenticateMemberInputDTO(
    val login: String,
    val password: String,
) {
    override fun toString(): String {
        return "AuthenticateMemberInputDTO(login='$login', password='******')"
    }
}
