package com.forsetijudge.core.application.helper.session

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import com.forsetijudge.core.port.output.cache.SessionCache
import com.forsetijudge.core.port.output.repository.SessionRepository
import com.forsetijudge.core.util.IdGenerator
import com.forsetijudge.core.util.SafeLogger
import java.time.OffsetDateTime
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class SessionCreator(
    private val sessionRepository: SessionRepository,
    private val sessionDeleter: SessionDeleter,
    private val sessionCache: SessionCache,
    @Value($$"${security.session.expiration.default_seconds}")
    private val defaultExpirationSeconds: Long,
    @Value($$"${security.session.expiration.root_seconds}")
    private val rootExpirationSeconds: Long,
) {
    private val logger = SafeLogger(this::class)

    /**
     * Creates a new session for the given member.
     *
     * @param member The member for whom the session is to be created.
     * @return The newly created session.
     */
    fun create(member: Member): Session {
        logger.info("Creating session for member with id = ${member.id}")

        sessionDeleter.deleteAllByMember(member)

        val expiresAtOffset =
            when (member.type) {
                Member.Type.ROOT -> rootExpirationSeconds
                else -> defaultExpirationSeconds
            }

        val session =
            Session(
                member = member,
                csrfToken = IdGenerator.getUUID(),
                expiresAt = OffsetDateTime.now().plusSeconds(expiresAtOffset),
            )
        sessionRepository.save(session)
        sessionCache.cache(session.toResponseBodyDTO())

        logger.info("Session created successfully with id = ${session.id}")
        return session
    }
}
