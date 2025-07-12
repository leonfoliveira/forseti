package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompClarificationEmitter
import io.github.leonfoliveira.judge.common.event.ClarificationEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ClarificationEventListener(
    private val stompClarificationEmitter: StompClarificationEmitter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(ClarificationEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: ClarificationEvent) {
        logger.info("Handling clarification event: ${event.clarification}")
        stompClarificationEmitter.emit(event.clarification)
    }
}
