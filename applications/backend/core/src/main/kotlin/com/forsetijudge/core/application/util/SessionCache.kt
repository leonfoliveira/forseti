package com.forsetijudge.core.application.util

import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.session.CreateSessionUseCase
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
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
    private val findSessionByIdUseCase: FindSessionByIdUseCase,
    private val createSessionUseCase: CreateSessionUseCase,
) {
    private val sessionIdsByMemberIdAndContestId = ConcurrentHashMap<Pair<UUID, UUID?>, UUID>()

    /**
     * Retrieves a session for the given memberId and contestId. If a valid cached session exists, it returns that.
     * Otherwise, it creates a new session using the CreateSessionUseCase and caches it before returning.
     *
     * @return A SessionResponseBodyDTO containing the session information
     */
    fun get(memberId: UUID): Session {
        val contestId = ExecutionContext.getContestIdNullable()
        val key = Pair(memberId, contestId)

        val cachedSessionId = sessionIdsByMemberIdAndContestId[key]

        if (cachedSessionId == null) {
            return getNewSession(memberId = memberId, contestId = contestId)
        }

        val session =
            try {
                findSessionByIdUseCase.execute(
                    FindSessionByIdUseCase.Command(
                        sessionId = cachedSessionId,
                    ),
                )
            } catch (e: NotFoundException) {
                return getNewSession(memberId = memberId, contestId = contestId)
            }

        return session
    }

    private fun getNewSession(
        memberId: UUID,
        contestId: UUID?,
    ): Session {
        val session =
            createSessionUseCase
                .execute(
                    CreateSessionUseCase.Command(
                        contestId = contestId,
                        memberId = memberId,
                    ),
                )

        sessionIdsByMemberIdAndContestId[Pair(memberId, contestId)] = session.id

        return session
    }
}
