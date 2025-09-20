package io.github.leonfoliveira.judge.autojudge.service

import io.github.leonfoliveira.judge.autojudge.adapter.docker.DockerSubmissionRunnerAdapter
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class RunSubmissionService(
    private val dockerSubmissionRunnerAdapter: DockerSubmissionRunnerAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun run(submission: Submission): Submission.Answer {
        logger.info("Running submission: ${submission.id}")
        val execution = dockerSubmissionRunnerAdapter.run(submission)
        logger.info("Submission completed with answer: ${execution.answer}")
        return execution.answer
    }
}
