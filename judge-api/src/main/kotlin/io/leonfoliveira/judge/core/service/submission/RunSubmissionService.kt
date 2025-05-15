package io.leonfoliveira.judge.core.service.submission

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import io.leonfoliveira.judge.core.port.SubmissionRunnerAdapter
import io.leonfoliveira.judge.core.repository.SubmissionRepository
import org.springframework.stereotype.Service

@Service
class RunSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val submissionRunnerAdapter: SubmissionRunnerAdapter,
    private val submissionEmitterAdapter: SubmissionEmitterAdapter,
) {
    fun run(id: Int): Submission {
        val submission =
            submissionRepository.findById(id).orElseThrow {
                NotFoundException("Could not find submission with id = $id")
            }
        if (submission.status != Submission.Status.JUDGING) {
            throw ForbiddenException("Submission with id = $id is not in a runnable state")
        }

        val result = submissionRunnerAdapter.run(submission)
        submission.status = result
        submissionRepository.save(submission)
        submissionEmitterAdapter.emit(submission)

        return submission
    }
}
