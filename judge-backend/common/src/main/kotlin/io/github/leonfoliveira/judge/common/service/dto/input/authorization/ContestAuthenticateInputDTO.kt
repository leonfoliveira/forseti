package io.github.leonfoliveira.judge.common.service.dto.input.authorization

data class ContestAuthenticateInputDTO(
    val login: String,
    val password: String,
) {
    override fun toString(): String = "ContestAuthenticateInputDTO(login='$login', password='******')"
}
