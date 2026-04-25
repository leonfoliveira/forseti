package com.forsetijudge.core.application.listener.ticket

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.repository.TicketRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class TicketCreatedEventListener(
    private val ticketRepository: TicketRepository,
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<TicketEvent.Created> {
    @Transactional
    override fun handle(event: TicketEvent.Created) {
        val ticket =
            ticketRepository.findById(event.ticketId) ?: throw NotFoundException("Could not find ticket with id: ${event.ticketId}")
        val contest = ticket.contest

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildTicketCreatedEvent(ticket))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildTicketCreatedEvent(ticket))
    }
}
