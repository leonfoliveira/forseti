package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Execution
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.input.usecase.submission.JudgeSubmissionUseCase
import com.forsetijudge.core.port.output.repository.ExecutionRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import java.util.UUID
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class JudgeSubmissionAnswerService(
    private val submissionRepository: SubmissionRepository,
    private val executionRepository: ExecutionRepository,
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

        if (command.detailsId != null) {
            createExecution(command, submission, command.detailsId)
        }

        submissionRepository.save(submission)
        businessEventPublisher.publish(SubmissionEvent.Updated(submission.id))

        logger.info("Submission answer updated successfully")
    }

    fun createExecution(
        command: JudgeSubmissionUseCase.Command,
        submission: Submission,
        detailsId: UUID,
    ) {
        logger.info("Creating execution for submission with id: ${command.submissionId}")

        val detailsAttachment =
            Attachment(
                id = detailsId,
                contest = submission.contest,
                filename = "details-${command.detailsId}.csv",
                contentType = "text/csv",
                context = Attachment.Context.EXECUTION_DETAILS,
            )

        val execution =
            Execution(
                submission = submission,
                answer = command.answer,
                totalTestCases = command.totalTestCases,
                approvedTestCases = command.approvedTestCases,
                maxCpuTimeMs = command.maxCpuTimeMs,
                maxClockTimeMs = command.maxClockTimeMs,
                maxPeakMemoryKb = command.maxPeakMemoryKb,
                details = detailsAttachment,
            )

        executionRepository.save(execution)
    }
}
