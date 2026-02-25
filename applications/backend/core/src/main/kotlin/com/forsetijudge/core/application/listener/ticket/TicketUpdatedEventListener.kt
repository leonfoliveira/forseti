package com.forsetijudge.core.application.listener.ticket

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO
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

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardAdmin(ticket.contest.id),
                event = BroadcastEvent.TICKET_CREATED,
                body = ticket.toResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardStaff(ticket.contest.id),
                event = BroadcastEvent.TICKET_CREATED,
                body = ticket.toResponseBodyDTO(),
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsMembers(ticket.contest.id, ticket.member.id),
                event = BroadcastEvent.TICKET_UPDATED,
                body = ticket.toResponseBodyDTO(),
            ),
        )
    }
}
