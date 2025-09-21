package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompClarificationEmitter
import io.github.leonfoliveira.judge.common.event.ClarificationCreatedEvent
import io.github.leonfoliveira.judge.common.event.ClarificationDeletedEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ClarificationEventsApiListener(
    private val stompClarificationEmitter: StompClarificationEmitter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(ClarificationCreatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: ClarificationCreatedEvent) {
        logger.info("Handling clarification created event: ${event.clarification}")
        stompClarificationEmitter.emit(event.clarification)
    }

    @TransactionalEventListener(ClarificationDeletedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: ClarificationDeletedEvent) {
        logger.info("Handling clarification deleted event: ${event.clarification}")
        stompClarificationEmitter.emitDeleted(event.clarification)
    }
}
