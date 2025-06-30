package io.github.leonfoliveira.judge.worker.service

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.worker.docker.DockerSubmissionRunnerAdapter
import io.github.leonfoliveira.judge.worker.feign.ApiClient
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class RunSubmissionService(
    private val dockerSubmissionRunnerAdapter: DockerSubmissionRunnerAdapter,
    private val apiClient: ApiClient,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun run(submission: Submission): Submission.Answer {
        logger.info("Running submission: ${submission.id}")
        val answer = dockerSubmissionRunnerAdapter.run(submission)
        logger.info("Submission completed with answer: $answer")
        apiClient.updateSubmissionAnswer(submission.id, answer)
        logger.info("Finished running submission")
        return answer
    }
}
