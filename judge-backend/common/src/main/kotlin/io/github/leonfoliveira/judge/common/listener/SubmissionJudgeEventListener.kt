package io.github.leonfoliveira.judge.common.listener

import io.github.leonfoliveira.judge.common.event.SubmissionAutoJudgeEvent
import io.github.leonfoliveira.judge.common.port.SubmissionQueueProducer
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionJudgeEventListener(
    private val submissionQueueProducer: SubmissionQueueProducer,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(SubmissionAutoJudgeEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionAutoJudgeEvent) {
        logger.info("Handling submission judge event: ${event.submission}")
        submissionQueueProducer.produce(event.submission)
    }
}
