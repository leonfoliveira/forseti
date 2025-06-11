package io.leonfoliveira.judge.core.dto.input.authorization

import io.leonfoliveira.judge.core.service.dto.input.authorization.AuthenticateRootInputDTO

data object AuthenticateRootInputDTOMockFactory {
    fun build(password: String = "password") =
        AuthenticateRootInputDTO(
            password = password,
        )
}
