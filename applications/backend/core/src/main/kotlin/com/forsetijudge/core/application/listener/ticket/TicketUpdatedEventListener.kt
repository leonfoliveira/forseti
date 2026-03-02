package com.forsetijudge.core.application.listener.ticket

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.ContestantPrivateBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.JudgePrivateBroadcastRoom
import com.forsetijudge.core.port.driven.repository.TicketRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class TicketUpdatedEventListener(
    private val ticketRepository: TicketRepository,
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<TicketEvent.Updated>() {
    @TransactionalEventListener(TicketEvent.Updated::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: TicketEvent.Updated) {
        super.onApplicationEvent(event)
    }

    @Transactional(readOnly = true)
    override fun handleEvent(event: TicketEvent.Updated) {
        val ticket =
            ticketRepository.findById(event.ticketId) ?: throw NotFoundException("Could not find ticket with id: ${event.ticketId}")
        val contest = ticket.contest

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildTicketUpdatedEvent(ticket))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildTicketUpdatedEvent(ticket))
        broadcastProducer.produce(ContestantPrivateBroadcastRoom(contest.id, ticket.member.id).buildTicketUpdatedEvent(ticket))
        broadcastProducer.produce(JudgePrivateBroadcastRoom(contest.id, ticket.member.id).buildTicketUpdatedEvent(ticket))
    }
}
