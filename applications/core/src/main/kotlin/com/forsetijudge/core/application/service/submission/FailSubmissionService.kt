package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.input.usecase.submission.FailSubmissionUseCase
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FailSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val businessEventPublisher: BusinessEventPublisher,
) : FailSubmissionUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Marks a submission as failed.
     */
    @Transactional
    override fun execute(command: FailSubmissionUseCase.Command) {
        logger.info("Failing submission with id: ${command.submissionId}")

        val submission =
            submissionRepository.findById(command.submissionId)
                ?: throw NotFoundException("Could not find submission with id: ${command.submissionId} in this contest")

        if (submission.status != Submission.Status.JUDGING) {
            logger.info("Submission with id: ${submission.id} is not in judging status. Skipping failing submission.")
            return
        }

        submission.status = Submission.Status.FAILED

        submissionRepository.save(submission)
        businessEventPublisher.publish(SubmissionEvent.Created(submission.id))

        logger.info("Submission failed successfully")
    }
}
