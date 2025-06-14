package io.github.leonfoliveira.judge.core.service.submission

import io.github.leonfoliveira.judge.core.domain.entity.Submission
import io.github.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.core.event.SubmissionEvent
import io.github.leonfoliveira.judge.core.repository.SubmissionRepository
import io.github.leonfoliveira.judge.core.util.TransactionalEventPublisher
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
        transactionalEventPublisher.publish(SubmissionEvent(this, submission))
        logger.info("Submission failed successfully")
        return submission
    }

    fun updateAnswer(
        submissionId: UUID,
        answer: Submission.Answer,
        force: Boolean = false,
    ): Submission {
        logger.info("Updating submission with id: $submissionId with answer: $answer")

        if (answer == Submission.Answer.NO_ANSWER) {
            throw ForbiddenException("Cannot update submission with NO_ANSWER")
        }
        val submission =
            submissionRepository.findById(submissionId).orElseThrow {
                NotFoundException("Could not find submission with id = $submissionId")
            }
        if (!force && submission.status != Submission.Status.JUDGING) {
            logger.info("Submission status is not JUDGING, skipping update")
            return submission
        }

        submission.status = Submission.Status.JUDGED
        submission.answer = answer
        submissionRepository.save(submission)
        transactionalEventPublisher.publish(SubmissionEvent(this, submission))
        logger.info("Submission status updated successfully")
        return submission
    }
}
