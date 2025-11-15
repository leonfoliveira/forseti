package io.github.leonfoliveira.forseti.common.application.service.dto.input.authorization

data class ContestAuthenticateInputDTO(
    val login: String,
    val password: String,
) {
    override fun toString(): String = "ContestAuthenticateInputDTO(login='$login', password='******')"
}
