package io.github.leonfoliveira.judge.worker.service

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.repository.SubmissionRepository
import io.github.leonfoliveira.judge.worker.docker.DockerSubmissionRunnerAdapter
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class RunSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val dockerSubmissionRunnerAdapter: DockerSubmissionRunnerAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun run(id: UUID): Submission.Answer {
        logger.info("Running submission with id: $id")

        val submission =
            submissionRepository.findById(id).orElseThrow {
                NotFoundException("Could not find submission with id = $id")
            }
        if (submission.status != Submission.Status.JUDGING) {
            throw ForbiddenException("Submission with id = $id is not in a runnable state")
        }

        val answer = dockerSubmissionRunnerAdapter.run(submission)
        logger.info("Submission has been run with answer: $answer")
        return answer
    }
}
