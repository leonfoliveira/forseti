package live.forseti.core.port.driving.usecase.session

import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.entity.Session

interface CreateSessionUseCase {
    /**
     * Creates a new session for a given member.
     *
     * @param member The member for whom to create the session.
     * @return The created session.
     */
    fun create(member: Member): Session
}
