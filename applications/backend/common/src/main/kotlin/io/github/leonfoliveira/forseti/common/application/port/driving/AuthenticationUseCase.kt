package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.domain.entity.Session
import io.github.leonfoliveira.forseti.common.application.dto.input.authorization.AuthenticateInputDTO
import io.github.leonfoliveira.forseti.common.application.dto.input.authorization.ContestAuthenticateInputDTO
import java.util.UUID

interface AuthenticationUseCase {
    /**
     * Authenticates a user with their credentials.
     *
     * @param inputDTO The authentication input data containing user credentials.
     * @return A session for the authenticated user.
     * @throws UnauthorizedException if the credentials are invalid.
     */
    fun authenticate(inputDTO: AuthenticateInputDTO): Session

    /**
     * Authenticates a user to access a specific contest.
     *
     * @param contestId The ID of the contest to authenticate for.
     * @param inputDTO The contest authentication input data.
     * @return A session for the authenticated user in the contest context.
     * @throws UnauthorizedException if the authentication fails.
     * @throws NotFoundException if the contest is not found.
     */
    fun authenticateToContest(
        contestId: UUID,
        inputDTO: ContestAuthenticateInputDTO,
    ): Session

    /**
     * Creates a new session for a given member.
     *
     * @param member The member for whom to create the session.
     * @return The created session.
     */
    fun createSession(member: Member): Session

    /**
     * Deletes the current user's session, effectively logging them out.
     */
    fun deleteCurrentSession()
}
