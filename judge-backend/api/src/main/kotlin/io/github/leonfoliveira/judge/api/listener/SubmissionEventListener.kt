package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.core.event.SubmissionEvent
import io.github.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class SubmissionEventListener(
    private val submissionEmitterAdapter: SubmissionEmitterAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @EventListener(SubmissionEvent::class)
    fun onApplicationEvent(event: SubmissionEvent) {
        logger.info("Handling submission event: ${event.submission}")
        submissionEmitterAdapter.emitForContest(event.submission)
    }
}
