package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.common.event.SubmissionJudgeEvent
import io.github.leonfoliveira.judge.common.port.SubmissionQueueAdapter
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

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
