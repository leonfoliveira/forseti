package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.api.adapter.dto.response.ticket.toResponseDTO
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class StompTicketEmitter(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Emits a ticket to the appropriate STOMP topics.
     *
     * @param ticket The ticket to be emitted.
     */
    fun emit(ticket: Ticket<*>) {
        logger.info(
            "Emitting ticket with id: ${ticket.id} for contest with id: ${ticket.contest.id}",
        )

        webSocketFanoutProducer.produce("/topic/contests/${ticket.contest.id}/tickets", ticket.toResponseDTO())
        webSocketFanoutProducer.produce("/topic/contests/${ticket.contest.id}/tickets/members/${ticket.member.id}", ticket.toResponseDTO())
    }
}
