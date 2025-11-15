package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.domain.entity.Session
import io.github.leonfoliveira.forseti.common.application.dto.input.authorization.AuthenticateInputDTO
import io.github.leonfoliveira.forseti.common.application.dto.input.authorization.ContestAuthenticateInputDTO
import java.util.UUID

interface AuthenticationUseCase {
    fun authenticate(inputDTO: AuthenticateInputDTO): Session

    fun authenticateToContest(
        contestId: UUID,
        inputDTO: ContestAuthenticateInputDTO,
    ): Session

    fun createSession(member: Member): Session

    fun deleteCurrentSession()
}
