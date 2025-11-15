package io.github.leonfoliveira.forseti.autojudge.application.service

import io.github.leonfoliveira.forseti.autojudge.application.port.driven.ApiClient
import io.github.leonfoliveira.forseti.autojudge.application.port.driven.SubmissionRunner
import io.github.leonfoliveira.forseti.autojudge.application.util.AutoJudgeMetrics
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.SubmissionRepository
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tags
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import java.util.function.Supplier

@Service
class JudgeSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val submissionRunner: SubmissionRunner,
    private val apiClient: ApiClient,
    private val meterRegistry: MeterRegistry,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Judges a submission by running it in a Docker container and calls the API to update its answer.
     *
     * @param contestId The ID of the contest.
     * @param submissionId The ID of the submission to be judged.
     * @throws NotFoundException if the submission with the given ID does not exist.
     */
    @Transactional
    fun judge(
        contestId: UUID,
        submissionId: UUID,
    ) {
        logger.info("Judging submission: $submissionId")

        val submission =
            submissionRepository.findEntityById(submissionId)
                ?: throw NotFoundException("Could not find submission with id = $submissionId")

        meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_RECEIVED_SUBMISSION).increment()

        val answer =
            try {
                val execution =
                    meterRegistry.timer(AutoJudgeMetrics.AUTO_JUDGE_SUBMISSION_RUN_TIME).record(
                        Supplier {
                            submissionRunner.run(submission)
                        },
                    )!!
                val answer = execution.answer
                meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_SUCCESSFUL_SUBMISSION, Tags.of("answer", answer.toString())).increment()
                logger.info("Execution completed with answer: ${execution.answer}. Updating submission answer.")
                execution.answer
            } catch (ex: Exception) {
                meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_FAILED_SUBMISSION).increment()
                throw ex
            }

        apiClient.updateSubmissionAnswer(contestId, submissionId, answer)
        logger.info("Submission judged")
    }
}
