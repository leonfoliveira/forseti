package io.leonfoliveira.judge.core.event

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

class SubmissionFailedEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)

@Component
class SubmissionFailedEventListener(
    private val submissionEmitterAdapter: SubmissionEmitterAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @EventListener(SubmissionFailedEvent::class)
    fun onApplicationEvent(event: SubmissionFailedEvent) {
        logger.info("Handling submission failed event: ${event.submission}")
        submissionEmitterAdapter.emitFail(event.submission)
    }
}
