package io.leonfoliveira.judge.core.service.submission

import io.leonfoliveira.judge.core.entity.Submission
import io.leonfoliveira.judge.core.entity.enumerate.Language
import io.leonfoliveira.judge.core.entity.model.RawAttachment
import io.leonfoliveira.judge.core.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.SubmissionQueueAdapter
import io.leonfoliveira.judge.core.repository.MemberRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.leonfoliveira.judge.core.repository.SubmissionRepository
import org.springframework.stereotype.Service

@Service
class CreateSubmissionService(
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
    private val submissionRepository: SubmissionRepository,
    private val bucketAdapter: BucketAdapter,
    private val submissionQueueAdapter: SubmissionQueueAdapter,
) {
    data class Input(
        val problemId: Int,
        val language: Language,
        val code: RawAttachment,
    )

    fun create(
        input: Input,
        memberId: Int,
    ): Submission {
        val member =
            memberRepository.findById(memberId).orElseThrow {
                NotFoundException("Could not find member with id = $memberId")
            }
        val problem =
            problemRepository.findById(input.problemId).orElseThrow {
                NotFoundException("Could not find problem with id = ${input.problemId}")
            }

        val submission =
            Submission(
                member = member,
                problem = problem,
                language = input.language,
                status = Submission.Status.JUDGING,
                code = bucketAdapter.upload(input.code),
            )
        submissionRepository.save(submission)
        submissionQueueAdapter.enqueue(submission)

        return submission
    }
}
