package com.forsetijudge.core.port.dto.input.authorization

data class AuthenticateInputDTO(
    val login: String,
    val password: String,
) {
    override fun toString(): String = "AuthenticateInputDTO(login='$login', password='******')"
}
