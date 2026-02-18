package com.forsetijudge.core.port.driving.usecase.ticket

import com.forsetijudge.core.domain.entity.Ticket
import java.util.UUID

interface FindTicketUseCase {
    /**
     * Finds all tickets for a given contest.
     *
     * @param contestId The ID of the contest to find tickets for.
     * @param memberId The ID of the member requesting the tickets
     * @return A list of tickets for the specified contest.
     */
    fun findAllByContestId(
        contestId: UUID,
        memberId: UUID,
    ): List<Ticket<*>>

    /**
     * Finds all tickets for a given member.
     *
     * @param contestId The ID of the contest to find tickets for.
     * @param memberId The ID of the member to find tickets for.
     * @return A list of tickets for the specified member.
     */
    fun findAllByContestIdAndMemberId(
        contestId: UUID,
        memberId: UUID,
    ): List<Ticket<*>>
}
