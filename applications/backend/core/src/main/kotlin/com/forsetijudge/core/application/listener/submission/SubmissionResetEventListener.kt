package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.port.driven.producer.SubmissionQueueProducer
import com.forsetijudge.core.port.driven.producer.payload.SubmissionQueuePayload
import org.slf4j.LoggerFactory
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

class SubmissionResetEventListener(
    private val submissionQueueProducer: SubmissionQueueProducer,
) : BusinessEventListener<SubmissionEvent.Reset> {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(SubmissionEvent.Reset::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: SubmissionEvent.Reset) {
        logger.info("Handling submission reset event with id: {}", event.submission.id)

        val submission = event.submission
        if (submission.contest.settings.isAutoJudgeEnabled) {
            submissionQueueProducer.produce(SubmissionQueuePayload(submissionId = submission.id))
        } else {
            logger.info("Auto judge is disabled for contest with id: {}", submission.contest.id)
        }
    }
}
