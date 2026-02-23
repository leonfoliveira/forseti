package com.forsetijudge.core.application.util

import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.session.CreateSessionUseCase
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import org.springframework.beans.factory.config.ConfigurableBeanFactory
import org.springframework.context.annotation.Scope
import org.springframework.stereotype.Component
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/**
 * SessionCache is a Spring-managed singleton that caches sessions per (memberId, contestId).
 */
@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
class SessionCache(
    private val createSessionUseCase: CreateSessionUseCase,
) {
    private val sessionsByMemberIdAndContestId = ConcurrentHashMap<Pair<UUID, UUID?>, SessionResponseBodyDTO>()

    /**
     * Retrieves a session for the given memberId and contestId. If a valid cached session exists, it returns that.
     * Otherwise, it creates a new session using the CreateSessionUseCase and caches it before returning.
     *
     * @param memberId The ID of the member for whom to retrieve the session
     * @param contestId The ID of the contest for which to retrieve the session (nullable)
     * @return A SessionResponseBodyDTO containing the session information
     */
    fun get(
        contestId: UUID?,
        memberId: UUID,
    ): SessionResponseBodyDTO {
        val key = Pair(memberId, contestId)

        val now = ExecutionContext.getStartAt()
        val session =
            sessionsByMemberIdAndContestId.compute(key) { _, cached ->
                if (cached == null || cached.expiresAt.isBefore(now)) {
                    createSessionUseCase
                        .execute(
                            CreateSessionUseCase.Command(
                                contestId = contestId,
                                memberId = memberId,
                            ),
                        ).toResponseBodyDTO()
                } else {
                    cached
                }
            }

        return session!!
    }
}
