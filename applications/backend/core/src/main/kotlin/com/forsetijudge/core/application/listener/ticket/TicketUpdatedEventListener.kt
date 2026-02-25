package com.forsetijudge.core.application.listener.ticket

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.ContestantPrivateBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.JudgePrivateBroadcastRoom
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class TicketUpdatedEventListener(
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<Ticket<*>, TicketEvent.Updated>() {
    @TransactionalEventListener(TicketEvent.Updated::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: TicketEvent.Updated) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Ticket<*>) {
        val ticket = payload

        broadcastProducer.produce(AdminDashboardBroadcastRoom(ticket.contest.id).buildTicketUpdatedEvent(ticket))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(ticket.contest.id).buildTicketUpdatedEvent(ticket))
        broadcastProducer.produce(ContestantPrivateBroadcastRoom(ticket.contest.id, ticket.member.id).buildTicketUpdatedEvent(ticket))
        broadcastProducer.produce(JudgePrivateBroadcastRoom(ticket.contest.id, ticket.member.id).buildTicketUpdatedEvent(ticket))
    }
}
