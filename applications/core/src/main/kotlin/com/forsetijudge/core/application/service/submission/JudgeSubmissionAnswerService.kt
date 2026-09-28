package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.input.usecase.submission.JudgeSubmissionUseCase
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class JudgeSubmissionAnswerService(
    private val submissionRepository: SubmissionRepository,
    private val businessEventPublisher: BusinessEventPublisher,
) : JudgeSubmissionUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Updates the answer of an existing submission.
     *
     * @param command The command containing the submission ID and the new answer.
     * @return The updated submission with its code result.
     */
    @Transactional
    override fun execute(command: JudgeSubmissionUseCase.Command) {
        logger.info(
            "Updating answer for submission with id: ${command.submissionId} to answer: ${command.answer}",
        )

        val submission =
            submissionRepository.findById(command.submissionId)
                ?: throw NotFoundException("Could not find submission with id: ${command.submissionId}")

        if (submission.status != Submission.Status.JUDGING) {
            throw ForbiddenException("Submission with id: ${command.submissionId} is not in JUDGING status")
        }

        submission.status = Submission.Status.JUDGED
        submission.answer = command.answer

        submissionRepository.save(submission)
        businessEventPublisher.publish(SubmissionEvent.Updated(submission.id))

        logger.info("Submission answer updated successfully")
    }
}
