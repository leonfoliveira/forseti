package io.github.leonfoliveira.forseti.common.listener

import io.github.leonfoliveira.forseti.common.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.event.SubmissionCreatedEvent
import io.github.leonfoliveira.forseti.common.event.SubmissionRerunEvent
import io.github.leonfoliveira.forseti.common.port.SubmissionQueueProducer
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionEventsListener(
    private val submissionQueueProducer: SubmissionQueueProducer,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(SubmissionCreatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionCreatedEvent) {
        logger.info("Handling submission created event: ${event.submission}")

        produceSubmissionQueue(event.submission)
    }

    @TransactionalEventListener(SubmissionRerunEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionRerunEvent) {
        logger.info("Handling submission rerun event: ${event.submission}")
        produceSubmissionQueue(event.submission)
    }

    private fun produceSubmissionQueue(submission: Submission) {
        if (submission.contest.settings.isAutoJudgeEnabled) {
            submissionQueueProducer.produce(submission)
        } else {
            logger.info("Auto judge is disabled for contest with id: ${submission.contest.id}")
        }
    }
}
