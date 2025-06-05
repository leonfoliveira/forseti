package io.leonfoliveira.judge.core.event

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import io.leonfoliveira.judge.core.port.SubmissionQueueAdapter
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

class SubmissionCreatedEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)

@Component
class SubmissionCreatedEventListener(
    private val submissionQueueAdapter: SubmissionQueueAdapter,
    private val submissionEmitterAdapter: SubmissionEmitterAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @EventListener(SubmissionCreatedEvent::class)
    fun onApplicationEvent(event: SubmissionCreatedEvent) {
        logger.info("Handling submission created event: ${event.submission}")
        submissionQueueAdapter.enqueue(event.submission)
        submissionEmitterAdapter.emitForContest(event.submission)
    }
}
