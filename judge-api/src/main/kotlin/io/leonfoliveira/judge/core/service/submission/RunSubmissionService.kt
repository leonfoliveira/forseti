package io.leonfoliveira.judge.core.service.submission

import io.leonfoliveira.judge.core.entity.Submission
import io.leonfoliveira.judge.core.exception.BusinessException
import io.leonfoliveira.judge.core.exception.NotFoundException
import io.leonfoliveira.judge.core.port.SubmissionRunnerAdapter
import io.leonfoliveira.judge.core.repository.SubmissionRepository
import org.springframework.stereotype.Service

@Service
class RunSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val submissionRunnerAdapter: SubmissionRunnerAdapter,
) {
    fun run(id: Int): Submission {
        val submission =
            submissionRepository.findById(id).orElseThrow {
                NotFoundException("Could not find submission with id = $id")
            }
        if (submission.status != Submission.Status.JUDGING) {
            throw BusinessException("Submission with id = $id is not in a runnable state")
        }

        val result = submissionRunnerAdapter.run(submission)
        submission.status = result

        return submissionRepository.save(submission)
    }
}
