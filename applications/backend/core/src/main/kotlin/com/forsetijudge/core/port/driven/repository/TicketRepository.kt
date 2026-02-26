package com.forsetijudge.core.port.driven.repository

import com.forsetijudge.core.domain.entity.Ticket
import org.springframework.data.jpa.repository.Query
import java.util.UUID

/**
 * Accessor for persistence operations related to Ticket entity
 */
interface TicketRepository : BaseRepository<Ticket<*>> {
    fun findById(id: UUID): Ticket<*>?

    @Query("SELECT t FROM Ticket t WHERE t.id = :id AND t.contest.id = :contestId AND deletedAt IS NULL")
    fun findByIdAndContestId(
        id: UUID,
        contestId: UUID,
    ): Ticket<*>?

    @Query("SELECT t FROM Ticket t WHERE t.contest.id = :contestId AND t.member.id = :memberId AND deletedAt IS NULL")
    fun findAllByContestIdAndMemberId(
        contestId: UUID,
        memberId: UUID,
    ): List<Ticket<*>>
}
