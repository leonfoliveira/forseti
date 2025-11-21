package live.forseti.core.port.driving.usecase.contest

import java.util.UUID

interface AuthorizeContestUseCase {
    fun checkIfMemberBelongsToContest(contestId: UUID)

    fun checkIfStarted(contestId: UUID)
}
