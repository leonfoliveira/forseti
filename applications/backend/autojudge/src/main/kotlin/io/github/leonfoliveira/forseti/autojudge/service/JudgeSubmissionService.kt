package io.github.leonfoliveira.forseti.autojudge.service

import io.github.leonfoliveira.forseti.autojudge.adapter.docker.DockerSubmissionRunnerAdapter
import io.github.leonfoliveira.forseti.autojudge.adapter.feign.ApiClient
import io.github.leonfoliveira.forseti.autojudge.util.AutoJudgeMetrics
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.repository.SubmissionRepository
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tags
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID
import java.util.function.Supplier

@Service
class JudgeSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val dockerSubmissionRunnerAdapter: DockerSubmissionRunnerAdapter,
    private val apiClient: ApiClient,
    private val meterRegistry: MeterRegistry,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @Transactional
    fun judge(
        contestId: UUID,
        submissionId: UUID,
    ) {
        logger.info("Judging submission: $submissionId")

        val submission =
            submissionRepository.findById(submissionId).orElseThrow {
                NotFoundException("Could not find submission with id = $submissionId")
            }

        meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_RECEIVED_SUBMISSION).increment()

        val answer =
            try {
                val execution =
                    meterRegistry.timer(AutoJudgeMetrics.AUTO_JUDGE_SUBMISSION_RUN_TIME).record(
                        Supplier {
                            dockerSubmissionRunnerAdapter.run(submission)
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
