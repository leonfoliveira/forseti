package io.github.leonfoliveira.forseti.autojudge.application.service

import io.github.leonfoliveira.forseti.autojudge.application.port.driven.ApiClient
import io.github.leonfoliveira.forseti.autojudge.application.port.driven.SubmissionRunner
import io.github.leonfoliveira.forseti.autojudge.application.port.driving.JudgeSubmissionUseCase
import io.github.leonfoliveira.forseti.autojudge.application.util.AutoJudgeMetrics
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.SubmissionRepository
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
     * Judges a submission by running it in a Docker container and calls the API to update its answer.
     *
     * @param contestId The ID of the contest.
     * @param submissionId The ID of the submission to be judged.
     * @throws NotFoundException if the submission with the given ID does not exist.
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

        AutoJudgeMetrics.AUTO_JUDGE_RECEIVED_SUBMISSION.inc()

        val answer =
            try {
                val startTime = System.nanoTime()
                val execution = submissionRunner.run(submission)
                val duration = (System.nanoTime() - startTime) / 1_000_000_000.0
                AutoJudgeMetrics.AUTO_JUDGE_SUBMISSION_RUN_TIME_SECONDS.observe(duration)

                AutoJudgeMetrics.AUTO_JUDGE_SUCCESSFUL_SUBMISSION
                    .labelValues(execution.answer.toString())
                    .inc()
                logger.info("Execution completed with answer: ${execution.answer}. Updating submission answer.")
                execution.answer
            } catch (ex: Exception) {
                AutoJudgeMetrics.AUTO_JUDGE_FAILED_SUBMISSION.inc()
                throw ex
            }

        apiClient.updateSubmissionAnswer(contestId, submissionId, answer)
        logger.info("Submission judged")
    }
}
