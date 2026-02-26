package com.forsetijudge.core.application.service.external.ticket

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import com.forsetijudge.core.port.driving.usecase.external.ticket.UpdateTicketStatusUseCase
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UpdateTicketStatusService(
    private val ticketRepository: TicketRepository,
    private val memberRepository: MemberRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : UpdateTicketStatusUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(command: UpdateTicketStatusUseCase.Command): Ticket<*> {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info(
            "Updating ticket status for ticketId: ${command.ticketId}, staffId: $contextMemberId, status: ${command.status}",
        )

        val ticket =
            ticketRepository.findByIdAndContestId(command.ticketId, contextContestId)
                ?: throw NotFoundException("Could not find ticket with id: ${command.ticketId} in this contest")
        val staff =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId in this contest")

        ContestAuthorizer(ticket.contest, staff)
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF)
            .throwIfErrors()

        ticket.staff = staff
        ticket.status = command.status
        ticketRepository.save(ticket)
        applicationEventPublisher.publishEvent(TicketEvent.Updated(ticket))

        logger.info("Ticket status updated successfully")
        return ticket
    }
}
