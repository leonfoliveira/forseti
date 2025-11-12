package io.github.leonfoliveira.forseti.common.service.submission

import io.github.leonfoliveira.forseti.common.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.domain.event.SubmissionRerunEvent
import io.github.leonfoliveira.forseti.common.domain.event.SubmissionUpdatedEvent
import io.github.leonfoliveira.forseti.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.repository.SubmissionRepository
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class UpdateSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Marks a submission as failed to be judged by the autojudge.
     * It indicates that something went wrong and the submission must be manually judged.
     *
     * @param submissionId The ID of the submission to be marked as failed.
     * @return The updated submission with status set to FAILED.
     * @throws NotFoundException if the submission with the given ID does not exist.
     */
    @Transactional
    fun fail(submissionId: UUID): Submission {
        logger.info("Failing submission with id: $submissionId")

        val submission =
            submissionRepository.findById(submissionId).orElseThrow {
                NotFoundException("Could not find submission with id = $submissionId")
            }

        submission.status = Submission.Status.FAILED
        submissionRepository.save(submission)
        applicationEventPublisher.publishEvent(SubmissionUpdatedEvent(this, submission))

        logger.info("Submission failed successfully")
        return submission
    }

    /**
     * Resets the status of a submission and enqueues it to be judged again by the autojudge.
     *
     * @param id The ID of the submission to be rerun.
     * @return The updated submission with status set to JUDGING.
     * @throws NotFoundException if the submission with the given ID does not exist.
     * @throws ForbiddenException if the submission is already being judged.
     */
    @Transactional
    fun rerun(id: UUID): Submission {
        logger.info("Rerunning submission with id: $id")

        val submission =
            submissionRepository.findById(id).orElseThrow {
                NotFoundException("Could not find submission with id = $id")
            }
        if (submission.status == Submission.Status.JUDGING) {
            throw ForbiddenException("Submission with id = $id is already being judged")
        }

        submission.status = Submission.Status.JUDGING
        submission.answer = Submission.Answer.NO_ANSWER
        submissionRepository.save(submission)
        applicationEventPublisher.publishEvent(SubmissionUpdatedEvent(this, submission))
        applicationEventPublisher.publishEvent(SubmissionRerunEvent(this, submission))

        logger.info("Submission updated enqueued and emitted")
        return submission
    }

    /**
     * Updates the answer of a submission.
     *
     * @param submissionId The ID of the submission to be updated.
     * @param answer The new answer to be set for the submission.
     * @param force If true, forces the update regardless of the current status of the submission.
     * @return The updated submission with the new answer and status set to JUDGED.
     * @throws NotFoundException if the submission with the given ID does not exist.
     * @throws ForbiddenException if the provided answer is NO_ANSWER.
     */
    @Transactional
    fun updateAnswer(
        submissionId: UUID,
        answer: Submission.Answer,
        force: Boolean = false,
    ): Submission {
        logger.info("Updating submission with id: $submissionId with answer: $answer")

        val submission =
            submissionRepository.findById(submissionId).orElseThrow {
                NotFoundException("Could not find submission with id = $submissionId")
            }
        if (answer == Submission.Answer.NO_ANSWER) {
            throw ForbiddenException("Cannot update submission with NO_ANSWER")
        }
        // Business rule: only update if status is JUDGING, unless forced
        if (!force && submission.status != Submission.Status.JUDGING) {
            logger.info("Submission status is not JUDGING, skipping update")
            return submission
        }

        submission.status = Submission.Status.JUDGED
        submission.answer = answer
        submissionRepository.save(submission)
        applicationEventPublisher.publishEvent(SubmissionUpdatedEvent(this, submission))

        logger.info("Submission status updated successfully")
        return submission
    }
}
