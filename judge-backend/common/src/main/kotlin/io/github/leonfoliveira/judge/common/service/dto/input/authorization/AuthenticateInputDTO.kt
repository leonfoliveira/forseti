package io.github.leonfoliveira.judge.common.service.dto.input.authorization

import java.util.UUID

data class AuthenticateInputDTO(
    val contestId: UUID?,
    val login: String,
    val password: String,
) {
    override fun toString(): String {
        return "AuthenticateInputDTO(login='$login', password='******')"
    }
}
