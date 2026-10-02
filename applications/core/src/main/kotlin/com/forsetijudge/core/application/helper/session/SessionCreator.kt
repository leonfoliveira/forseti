package com.forsetijudge.core.application.helper.session

import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.model.Session
import com.forsetijudge.core.port.output.cache.SessionCache
import com.forsetijudge.core.util.IdGenerator
import com.forsetijudge.core.util.SafeLogger
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class SessionCreator(
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
     * @param contestId The ID of the contest for which the session is being created. This can be null if the session is not associated with any contest.
     * @param member The member for whom the session is to be created.
     * @return The newly created session.
     */
    fun create(
        contestId: UUID?,
        member: Member,
    ): Session {
        logger.info("Creating session for member with id = ${member.id}")

        sessionDeleter.deleteByMember(member)

        val expiresAtOffset =
            when (member.type) {
                Member.Type.ROOT -> rootExpirationSeconds
                else -> defaultExpirationSeconds
            }

        val session =
            Session(
                id = IdGenerator.getUUID(),
                contestId = contestId,
                member =
                    Session.Member(
                        id = member.id,
                        type = member.type,
                        name = member.name,
                    ),
                csrfToken = IdGenerator.getUUID(),
                expiresAt = OffsetDateTime.now().plusSeconds(expiresAtOffset),
            )
        sessionCache.cache(session)

        logger.info("Session created successfully with id = ${session.id}")
        return session
    }
}
