package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.port.driven.queue.SubmissionQueueProducer
import com.forsetijudge.core.port.driven.queue.payload.SubmissionQueuePayload
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionResetEventListener(
    private val submissionQueueProducer: SubmissionQueueProducer,
) : BusinessEventListener<SubmissionEvent.Reset>() {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener(SubmissionEvent.Reset::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: SubmissionEvent.Reset) {
        super.onApplicationEvent(event)
    }

    override fun handleEvent(event: SubmissionEvent.Reset) {
        val submission = event.submission
        val contest = submission.contest

        if (submission.contest.settings.isAutoJudgeEnabled) {
            submissionQueueProducer.produce(SubmissionQueuePayload(submissionId = submission.id))
        } else {
            logger.info("Auto judge is disabled for contest with id: ${contest.id}")
        }
    }
}
