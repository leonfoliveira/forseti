package io.leonfoliveira.judge.core.service.submission

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.event.SubmissionStatusUpdatedEvent
import io.leonfoliveira.judge.core.port.SubmissionRunnerAdapter
import io.leonfoliveira.judge.core.repository.SubmissionRepository
import io.leonfoliveira.judge.core.util.TransactionalEventPublisher
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class RunSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val submissionRunnerAdapter: SubmissionRunnerAdapter,
    private val transactionalEventPublisher: TransactionalEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun run(id: Int): Submission {
        logger.info("Running submission with id: $id")

        val submission =
            submissionRepository.findById(id).orElseThrow {
                NotFoundException("Could not find submission with id = $id")
            }
        if (submission.status != Submission.Status.JUDGING) {
            throw ForbiddenException("Submission with id = $id is not in a runnable state")
        }

        val result = submissionRunnerAdapter.run(submission)
        logger.info("Submission has been run with result: $result")
        submission.status = result
        submissionRepository.save(submission)
        transactionalEventPublisher.publish(SubmissionStatusUpdatedEvent(this, submission))

        logger.info("Finished running and publishing submission")
        return submission
    }
}
