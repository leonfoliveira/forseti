package io.leonfoliveira.judge.core.service.dto.input

data object AuthenticateRootInputDTOMockFactory {
    fun build(password: String = "password") =
        AuthenticateRootInputDTO(
            password = password,
        )
}
