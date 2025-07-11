package io.github.leonfoliveira.judge.common.listener

import io.github.leonfoliveira.judge.common.event.SubmissionJudgeEvent
import io.github.leonfoliveira.judge.common.port.SubmissionQueueAdapter
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionJudgeEventListener(
    private val submissionQueueAdapter: SubmissionQueueAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(SubmissionJudgeEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionJudgeEvent) {
        logger.info("Handling submission judge event: ${event.submission}")
        submissionQueueAdapter.enqueue(event.submission)
    }
}