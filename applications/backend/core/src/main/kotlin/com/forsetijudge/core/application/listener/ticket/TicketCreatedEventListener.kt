package com.forsetijudge.core.application.listener.ticket

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.ticket.toResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

class TicketCreatedEventListener(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) : BusinessEventListener<TicketEvent.Created> {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(TicketEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: TicketEvent.Created) {
        logger.info("Handling ticket created event with id: {}", event.ticket.id)

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
