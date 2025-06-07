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

        submission.status = Submission.Status.FAILED
        submissionRepository.save(submission)
        transactionalEventPublisher.publish(SubmissionStatusUpdatedEvent(this, submission))
        logger.info("Submission failed successfully")
        return submission
    }

    fun judge(
        submissionId: UUID,
        answer: Submission.Answer,
    ): Submission {
        logger.info("Updating submission with id: $submissionId with answer: $answer")

        if (answer == Submission.Answer.NO_ANSWER) {
            throw ForbiddenException("Cannot update submission with NO_ANSWER")
        }
        val submission =
            submissionRepository.findById(submissionId).orElseThrow {
                NotFoundException("Could not find submission with id = $submissionId")
            }

        if (submission.status == Submission.Status.JUDGING) {
            throw ForbiddenException("Cannot update submission with status: ${submission.status}")
        }

        submission.status = Submission.Status.JUDGED
        submission.answer = answer
        submissionRepository.save(submission)
        transactionalEventPublisher.publish(SubmissionStatusUpdatedEvent(this, submission))
        logger.info("Submission status updated successfully")
        return submission
    }
}
