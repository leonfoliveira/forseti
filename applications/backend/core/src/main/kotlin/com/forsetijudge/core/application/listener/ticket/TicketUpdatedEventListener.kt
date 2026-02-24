package com.forsetijudge.core.application.listener.ticket

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class TicketUpdatedEventListener(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) : BusinessEventListener<Ticket<*>, TicketEvent.Updated>() {
    @TransactionalEventListener(TicketEvent.Updated::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: TicketEvent.Updated) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Ticket<*>) {
        val ticket = payload
        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${ticket.contest.id}/tickets",
                ticket.toResponseBodyDTO(),
            ),
        )
        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${ticket.contest.id}/members/${ticket.member.id}/tickets",
                ticket.toResponseBodyDTO(),
            ),
        )
    }
}
