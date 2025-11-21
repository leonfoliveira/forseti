package io.github.leonfoliveira.forseti.api.adapter.driven.listener

import io.github.leonfoliveira.forseti.api.adapter.driven.emitter.StompClarificationEmitter
import live.forseti.core.domain.event.ClarificationCreatedEvent
import live.forseti.core.domain.event.ClarificationDeletedEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ClarificationEventsApiListener(
    private val clarificationEmitter: StompClarificationEmitter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Handles ClarificationCreatedEvent after the transaction is committed
     *
     * @param event the ClarificationCreatedEvent
     */
    @TransactionalEventListener(ClarificationCreatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: ClarificationCreatedEvent) {
        logger.info("Handling clarification created event: ${event.clarification}")
        clarificationEmitter.emit(event.clarification)
    }

    /**
     * Handles ClarificationDeletedEvent after the transaction is committed
     *
     * @param event the ClarificationDeletedEvent
     */
    @TransactionalEventListener(ClarificationDeletedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: ClarificationDeletedEvent) {
        logger.info("Handling clarification deleted event: ${event.clarification}")
        clarificationEmitter.emitDeleted(event.clarification)
    }
}
