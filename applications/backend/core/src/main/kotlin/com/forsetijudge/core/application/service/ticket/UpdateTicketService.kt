package com.forsetijudge.core.application.service.ticket

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.event.TicketUpdatedEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import com.forsetijudge.core.port.driving.usecase.ticket.UpdateTicketUseCase
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UpdateTicketService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val ticketRepository: TicketRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : UpdateTicketUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Updates the status of an existing ticket.
     *
     * @param contestId The ID of the contest to which the ticket belongs.
     * @param ticketId The ID of the ticket to be updated.
     * @param staffId The ID of the staff member performing the update.
     * @param status The new status to set for the ticket.
     * @return The updated Ticket entity.
     */
    override fun updateStatus(
        contestId: UUID,
        ticketId: UUID,
        staffId: UUID,
        status: Ticket.Status,
    ): Ticket<*> {
        logger.info("Updating ticket status for contestId: $contestId, ticketId: $ticketId, staffUUID: $staffId, status: $status")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id: $contestId")
        val staff =
            memberRepository.findEntityById(staffId)
                ?: throw NotFoundException("Could not find member with id: $staffId")
        val ticket =
            ticketRepository.findByIdAndContestId(contestId, ticketId)
                ?: throw NotFoundException("Could not find ticket with id: $ticketId in this contest")

        ContestAuthorizer(contest, staff).checkMemberType(Member.Type.STAFF)

        ticket.status = status
        applicationEventPublisher.publishEvent(TicketUpdatedEvent(this, ticket))
        logger.info("Ticket status updated successfully")
        return ticketRepository.save(ticket)
    }
}
