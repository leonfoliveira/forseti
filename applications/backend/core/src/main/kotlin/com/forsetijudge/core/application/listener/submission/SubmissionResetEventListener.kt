package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.queue.SubmissionQueueProducer
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class SubmissionResetEventListener(
    private val submissionRepository: SubmissionRepository,
    private val submissionQueueProducer: SubmissionQueueProducer,
) : BusinessEventListener<SubmissionEvent.Reset> {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun handle(event: SubmissionEvent.Reset) {
        val submission =
            submissionRepository.findById(event.submissionId)
                ?: throw NotFoundException("Could not find submission with id: ${event.submissionId}")
        val contest = submission.contest

        if (contest.settings.isAutoJudgeEnabled) {
            submissionQueueProducer.produce(submission)
        } else {
            logger.info("Auto judge is disabled for contest with id: ${contest.id}")
        }
    }
}
