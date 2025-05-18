package io.leonfoliveira.judge.core.service.dto.input

data object AuthenticateMemberInputDTOMockFactory {
    fun build(
        login: String = "login",
        password: String = "password",
    ) = AuthenticateMemberInputDTO(
        login = login,
        password = password,
    )
}
