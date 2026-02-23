package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Session
import org.springframework.data.jpa.repository.Query
import java.time.OffsetDateTime
import java.util.UUID

/**
 * Accessor for persistence operations related to Session entity
 */
interface SessionRepository : BaseRepository<Session> {
    fun findById(id: UUID): Session?

    @Query("SELECT s FROM Session s WHERE s.id = ?1 AND s.contest.id = ?2 AND s.deletedAt IS NULL")
    fun findByIdAndContestId(
        id: UUID,
        contestId: UUID,
    ): Session?

    @Query("SELECT s FROM Session s WHERE s.member.id = ?1 AND s.expiresAt > ?2 AND s.deletedAt IS NULL")
    fun findAllByMemberIdAndExpiresAtGreaterThan(
        memberId: UUID,
        expiresAt: OffsetDateTime,
    ): List<Session>
}
