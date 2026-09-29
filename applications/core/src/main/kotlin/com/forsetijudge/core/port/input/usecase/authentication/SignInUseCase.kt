package com.forsetijudge.core.port.input.usecase.authentication

import com.forsetijudge.core.domain.model.Session
import java.util.UUID

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
     * @param contestId The ID of the contest the user is trying to sign in to. Optional; can be null if not signing in to a specific contest.
     * @param login The user's login (username or email).
     * @param password The user's password.
     */
    data class Command(
        val contestId: UUID?,
        val login: String,
        val password: String,
    )
}
