package com.forsetijudge.core.port.output.repository

import com.forsetijudge.core.domain.entity.Session
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.data.jpa.repository.Query

/**
 * Accessor for persistence operations related to Session entity
 */
interface SessionRepository : BaseRepository<Session> {
    @Query("SELECT s FROM Session s WHERE s.id = ?1 AND s.deletedAt IS NULL")
    fun findById(id: UUID): Session?

    @Query("SELECT s FROM Session s WHERE s.member.id = ?1 AND s.expiresAt > ?2 AND s.deletedAt IS NULL")
    fun findAllByMemberIdAndExpiresAtGreaterThan(
        memberId: UUID,
        expiresAt: OffsetDateTime,
    ): List<Session>
}
