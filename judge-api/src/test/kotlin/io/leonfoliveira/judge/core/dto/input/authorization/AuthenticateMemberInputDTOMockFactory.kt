package io.leonfoliveira.judge.core.dto.input.authorization

import io.leonfoliveira.judge.core.service.dto.input.authorization.AuthenticateMemberInputDTO

data object AuthenticateMemberInputDTOMockFactory {
    fun build(
        login: String = "login",
        password: String = "password",
    ) = AuthenticateMemberInputDTO(
        login = login,
        password = password,
    )
}
