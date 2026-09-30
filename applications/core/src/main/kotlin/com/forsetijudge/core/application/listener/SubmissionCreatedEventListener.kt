package com.forsetijudge.core.application.listener

import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.output.queue.SubmissionQueueProducer
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Suppress("unused")
class SubmissionCreatedEventListener(
    private val submissionRepository: SubmissionRepository,
    private val submissionQueueProducer: SubmissionQueueProducer,
) {
    private val logger = SafeLogger(this::class)

    @TransactionalEventListener
    fun handle(event: SubmissionEvent.Created) {
        logger.info("Handling submission created event for submission with id: ${event.submissionId}")

        val submission =
            submissionRepository.findById(event.submissionId)
                ?: throw NotFoundException("Could not find submission with id: ${event.submissionId}")
        val contest = submission.contest

        submissionQueueProducer.produce(
            SubmissionQueueProducer.Message(
                contestId = contest.id,
                submissionId = submission.id,
                language = submission.language,
                codeId = submission.code.id,
                codeFilename = submission.code.filename,
                timeLimitMs = submission.problem.timeLimitMs,
                memoryLimitMb = submission.problem.memoryLimitMb,
                testCasesId = submission.problem.testCases.id,
            ),
        )
    }
}
