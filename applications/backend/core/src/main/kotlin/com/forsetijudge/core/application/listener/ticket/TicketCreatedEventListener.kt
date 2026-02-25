package com.forsetijudge.core.application.listener.ticket

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class TicketCreatedEventListener(
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<Ticket<*>, TicketEvent.Created>() {
    @TransactionalEventListener(TicketEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: TicketEvent.Created) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Ticket<*>) {
        val ticket = payload

        broadcastProducer.produce(AdminDashboardBroadcastRoom(ticket.contest.id).buildTicketCreatedEvent(ticket))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(ticket.contest.id).buildTicketCreatedEvent(ticket))
    }
}
