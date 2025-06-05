package io.leonfoliveira.judge.core.event

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

class SubmissionStatusUpdatedEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)

@Component
class SubmissionStatusUpdatedEventListener(
    private val submissionEmitterAdapter: SubmissionEmitterAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @EventListener(SubmissionStatusUpdatedEvent::class)
    fun onApplicationEvent(event: SubmissionStatusUpdatedEvent) {
        logger.info("Handling submission status updated event: ${event.submission}")
        submissionEmitterAdapter.emitForMember(event.submission)
        submissionEmitterAdapter.emitForContest(event.submission)
    }
}
