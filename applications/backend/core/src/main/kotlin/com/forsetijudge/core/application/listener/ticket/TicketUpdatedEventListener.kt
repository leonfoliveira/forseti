package com.forsetijudge.core.application.listener.ticket

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

class TicketUpdatedEventListener(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) : BusinessEventListener<TicketEvent.Updated> {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(TicketEvent.Updated::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: TicketEvent.Updated) {
        logger.info("Handling ticket created updated with id: {}", event.ticket.id)

        val ticket = event.ticket
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
