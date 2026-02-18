package com.forsetijudge.api.adapter.driving.listener

import com.forsetijudge.api.adapter.driven.emitter.StompTicketEmitter
import com.forsetijudge.core.domain.event.TicketCreatedEvent
import com.forsetijudge.core.domain.event.TicketUpdatedEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class TicketEventsApiListener(
    private val ticketEmitter: StompTicketEmitter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Handles TicketCreatedEvent after the transaction is committed
     *
     * @param event the TicketCreatedEvent
     */
    @TransactionalEventListener(TicketCreatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: TicketCreatedEvent) {
        logger.info("Handling ticket created event: $event")
        ticketEmitter.emit(event.ticket)
    }

    /**
     * Handles TicketUpdatedEvent after the transaction is committed
     *
     * @param event the TicketUpdatedEvent
     */
    @TransactionalEventListener(TicketUpdatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: TicketUpdatedEvent) {
        logger.info("Handling ticket updated event: $event")
        ticketEmitter.emit(event.ticket)
    }
}
