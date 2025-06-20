package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompSubmissionEmitter
import io.github.leonfoliveira.judge.common.event.SubmissionEvent
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class SubmissionEventListener(
    private val stompSubmissionEmitter: StompSubmissionEmitter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @EventListener(SubmissionEvent::class)
    fun onApplicationEvent(event: SubmissionEvent) {
        logger.info("Handling submission event: ${event.submission}")
        stompSubmissionEmitter.emit(event.submission)
    }
}
