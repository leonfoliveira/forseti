package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.util.CoreMetrics
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.ApiClient
import com.forsetijudge.core.port.driven.SubmissionRunner
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.submission.JudgeSubmissionUseCase
import com.forsetijudge.core.port.dto.request.UpdateSubmissionAnswerRequestDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class JudgeSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val submissionRunner: SubmissionRunner,
    private val apiClient: ApiClient,
) : JudgeSubmissionUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Judges a submission and call the API to update its answer.
     *
     * @param contestId The ID of the contest.
     * @param submissionId The ID of the submission to be judged.
     * @throws com.forsetijudge.core.domain.exception.NotFoundException if the submission with the given ID does not exist.
     */
    @Transactional
    override fun judge(
        contestId: UUID,
        submissionId: UUID,
    ) {
        logger.info("Judging submission: $submissionId")

        val submission =
            submissionRepository.findEntityById(submissionId)
                ?: throw NotFoundException("Could not find submission with id = $submissionId")

        CoreMetrics.RECEIVED_SUBMISSION.inc()

        val answer =
            try {
                val execution =
                    CoreMetrics.SUBMISSION_RUN_TIME_SECONDS.run {
                        submissionRunner.run(submission)
                    }

                CoreMetrics.SUCCESSFUL_SUBMISSION
                    .labelValues(execution.answer.toString())
                    .inc()
                logger.info("Execution completed with answer: ${execution.answer}. Updating submission answer.")
                execution.answer
            } catch (ex: Exception) {
                CoreMetrics.FAILED_SUBMISSION.inc()
                throw ex
            }

        apiClient.updateSubmissionAnswer(contestId, submissionId, UpdateSubmissionAnswerRequestDTO(answer))
        logger.info("Submission judged")
    }
}
