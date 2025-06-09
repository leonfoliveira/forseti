package io.leonfoliveira.judge.core.event

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.port.SubmissionQueueAdapter
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

class SubmissionJudgeEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)

@Component
class SubmissionJudgeEventListener(
    private val submissionQueueAdapter: SubmissionQueueAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @EventListener(SubmissionJudgeEvent::class)
    fun onApplicationEvent(event: SubmissionJudgeEvent) {
        logger.info("Handling submission judge event: ${event.submission}")
        submissionQueueAdapter.enqueue(event.submission)
    }
}
