package com.forsetijudge.core.service.authentication

import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.authentication.SignInUseCase

class SignInService : SignInUseCase {
    /**
     * Authenticates a user and creates a new session.
     *
     * @param command The command containing the login credentials.
     * @return The created session if authentication is successful.
     */
    override fun execute(command: SignInUseCase.Command): SessionResponseBodyDTO {
        TODO("Not yet implemented")
    }
}
