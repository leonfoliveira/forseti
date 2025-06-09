package io.leonfoliveira.judge.core.service.submission

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.event.SubmissionEvent
import io.leonfoliveira.judge.core.event.SubmissionJudgeEvent
import io.leonfoliveira.judge.core.port.SubmissionRunnerAdapter
import io.leonfoliveira.judge.core.repository.SubmissionRepository
import io.leonfoliveira.judge.core.util.TransactionalEventPublisher
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class RunSubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val submissionRunnerAdapter: SubmissionRunnerAdapter,
    private val transactionalEventPublisher: TransactionalEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun rerun(id: UUID): Submission {
        logger.info("Rerunning submission with id: $id")

        val submission =
            submissionRepository.findById(id).orElseThrow {
                NotFoundException("Could not find submission with id = $id")
            }
        if (submission.status == Submission.Status.JUDGING) {
            throw ForbiddenException("Submission with id = $id is already being judged")
        }

        submission.status = Submission.Status.JUDGING
        submission.answer = Submission.Answer.NO_ANSWER
        submissionRepository.save(submission)
        transactionalEventPublisher.publish(SubmissionEvent(this, submission))
        transactionalEventPublisher.publish(SubmissionJudgeEvent(this, submission))
        logger.info("Submission updated enqueued and emitted")
        return submission
    }

    fun run(id: UUID): Submission {
        logger.info("Running submission with id: $id")

        val submission =
            submissionRepository.findById(id).orElseThrow {
                NotFoundException("Could not find submission with id = $id")
            }
        if (submission.status != Submission.Status.JUDGING) {
            throw ForbiddenException("Submission with id = $id is not in a runnable state")
        }

        val answer = submissionRunnerAdapter.run(submission)
        logger.info("Submission has been run with answer: $answer")

        submission.status = Submission.Status.JUDGED
        submission.answer = answer
        submissionRepository.save(submission)
        transactionalEventPublisher.publish(SubmissionEvent(this, submission))
        logger.info("Finished running and publishing submission")
        return submission
    }
}
