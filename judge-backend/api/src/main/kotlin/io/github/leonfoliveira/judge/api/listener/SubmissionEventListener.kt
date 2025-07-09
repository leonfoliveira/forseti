package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompSubmissionEmitter
import io.github.leonfoliveira.judge.common.event.SubmissionEvent
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionEventListener(
    private val stompSubmissionEmitter: StompSubmissionEmitter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(SubmissionEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionEvent) {
        logger.info("Handling submission event: ${event.submission}")
        stompSubmissionEmitter.emit(event.submission)
    }
}
