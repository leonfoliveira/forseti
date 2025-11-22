package live.forseti.core.port.driving.usecase.authentication

import live.forseti.core.domain.entity.Session
import live.forseti.core.port.dto.input.authorization.AuthenticateInputDTO
import live.forseti.core.port.dto.input.authorization.ContestAuthenticateInputDTO
import java.util.UUID

interface AuthenticateUseCase {
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
}
