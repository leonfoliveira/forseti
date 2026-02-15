package com.forsetijudge.core.application.listener

import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionCreatedEvent
import com.forsetijudge.core.domain.event.SubmissionRerunEvent
import com.forsetijudge.core.port.driven.producer.SubmissionQueueProducer
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionEventsListener(
    private val submissionQueueProducer: SubmissionQueueProducer,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Listen for submission created events and produce to submission queue. It only executes after the transaction context is committed.
     */
    @TransactionalEventListener(SubmissionCreatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionCreatedEvent) {
        logger.info("Handling submission created event: ${event.submission}")
        produceSubmissionQueue(event.submission)
    }

    /**
     * Listen for submission rerun events and produce to submission queue. It only executes after the transaction context is committed.
     */
    @TransactionalEventListener(SubmissionRerunEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionRerunEvent) {
        logger.info("Handling submission rerun event: ${event.submission}")
        produceSubmissionQueue(event.submission)
    }

    /**
     * Produce submission to submission queue if autojudge is enabled for the contest.
     */
    private fun produceSubmissionQueue(submission: Submission) {
        if (submission.contest.settings.isAutoJudgeEnabled) {
            submissionQueueProducer.produce(submission)
        } else {
            logger.info("Auto judge is disabled for contest with id: ${submission.contest.id}")
        }
    }
}
