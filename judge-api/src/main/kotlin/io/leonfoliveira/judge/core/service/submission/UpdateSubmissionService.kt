package io.leonfoliveira.judge.core.service.submission

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.event.SubmissionStatusUpdatedEvent
import io.leonfoliveira.judge.core.repository.SubmissionRepository
import io.leonfoliveira.judge.core.util.TransactionalEventPublisher
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UpdateSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val transactionalEventPublisher: TransactionalEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun fail(submissionId: UUID): Submission {
        logger.info("Failing submission with id: $submissionId")

        val submission =
            submissionRepository.findById(submissionId).orElseThrow {
                NotFoundException("Could not find submission with id = $submissionId")
            }

        submission.hasFailed = true
        submissionRepository.save(submission)
        logger.info("Submission failed successfully")
        return submission
    }

    fun updateStatus(
        submissionId: UUID,
        status: Submission.Status,
    ): Submission {
        logger.info("Updating submission with id: $submissionId to status: $status")

        val submission =
            submissionRepository.findById(submissionId).orElseThrow {
                NotFoundException("Could not find submission with id = $submissionId")
            }

        if (submission.status != Submission.Status.JUDGING) {
            throw ForbiddenException("Cannot update submission with status: ${submission.status}")
        }
        if (!submission.hasFailed) {
            throw ForbiddenException("Cannot manually update submission that has not failed")
        }

        submission.status = status
        submissionRepository.save(submission)
        transactionalEventPublisher.publish(SubmissionStatusUpdatedEvent(this, submission))
        logger.info("Submission status updated successfully")
        return submission
    }
}
