package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompClarificationEmitter
import io.github.leonfoliveira.judge.core.event.ClarificationEvent
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class ClarificationEventListener(
    private val stompClarificationEmitter: StompClarificationEmitter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @EventListener(ClarificationEvent::class)
    fun onApplicationEvent(event: ClarificationEvent) {
        logger.info("Handling clarification event: ${event.clarification}")
        stompClarificationEmitter.emit(event.clarification)
    }
}
