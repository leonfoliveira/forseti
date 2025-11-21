package live.forseti.core.application.service.session

import live.forseti.core.application.service.member.FindMemberService
import live.forseti.core.domain.entity.Session
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driving.usecase.session.RefreshSessionUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class RefreshSessionService(
    private val createSessionService: CreateSessionService,
    private val findMemberService: FindMemberService,
) : RefreshSessionUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    companion object {
        const val THRESHOLD_MINUTES = 1L
    }

    /**
     * Creates a new session for the member with the given ID.
     * Keep the current session if it is still valid.
     *
     * @param memberId The ID of the member
     * @return The refreshed or existing session
     * @throws NotFoundException if the member is not found
     */
    override fun refresh(memberId: UUID): Session {
        val currentSession = RequestContext.getContext().session

        if (currentSession == null ||
            currentSession.isAboutToExpire(THRESHOLD_MINUTES) ||
            currentSession.member.id != memberId
        ) {
            logger.info("Refreshing session for member with id: $memberId")
            val member = findMemberService.findById(memberId)
            return createSessionService.create(member)
        }

        logger.info("Current session with id: ${currentSession.id} is still valid")
        return currentSession
    }
}
