package io.github.leonfoliveira.forseti.common.service.submission

import io.github.leonfoliveira.forseti.common.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.event.SubmissionRerunEvent
import io.github.leonfoliveira.forseti.common.event.SubmissionUpdatedEvent
import io.github.leonfoliveira.forseti.common.repository.SubmissionRepository
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UpdateSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
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
        applicationEventPublisher.publishEvent(SubmissionUpdatedEvent(this, submission))

        logger.info("Submission failed successfully")
        return submission
    }

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
