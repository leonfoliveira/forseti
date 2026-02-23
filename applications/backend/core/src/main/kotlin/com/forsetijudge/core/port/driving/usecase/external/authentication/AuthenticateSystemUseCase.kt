package com.forsetijudge.core.port.driving.usecase.external.authentication

import com.forsetijudge.core.domain.entity.Member

interface AuthenticateSystemUseCase {
    /**
     * Authenticates a system member.
     *
     * @param command The command containing the login and type of the system member to authenticate.
     */
    fun execute(command: Command)

    /**
     * Command for authenticating a system member.
     *
     * @param login The login of the system member to authenticate.
     * @param type The type of the system member to authenticate.
     */
    data class Command(
        val login: String,
        val type: Member.Type,
    )
}
