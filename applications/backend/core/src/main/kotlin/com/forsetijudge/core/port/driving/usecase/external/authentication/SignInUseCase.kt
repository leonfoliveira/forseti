package com.forsetijudge.core.port.driving.usecase.external.authentication

import com.forsetijudge.core.domain.entity.Session

interface SignInUseCase {
    /**
     * Authenticates a user and creates a new session.
     *
     * @param command The command containing the login credentials.
     * @return The created session if authentication is successful.
     */
    fun execute(command: Command): Session

    /**
     * Command for signing in a user.
     *
     * @param login The user's login (username or email).
     * @param password The user's password.
     */
    data class Command(
        val login: String,
        val password: String,
    )
}
