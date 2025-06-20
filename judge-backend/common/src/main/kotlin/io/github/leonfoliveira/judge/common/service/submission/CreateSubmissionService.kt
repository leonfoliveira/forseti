package io.github.leonfoliveira.judge.common.service.submission

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.event.SubmissionEvent
import io.github.leonfoliveira.judge.common.event.SubmissionJudgeEvent
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.repository.ProblemRepository
import io.github.leonfoliveira.judge.common.repository.SubmissionRepository
import io.github.leonfoliveira.judge.common.service.dto.input.submission.CreateSubmissionInputDTO
import io.github.leonfoliveira.judge.common.util.TransactionalEventPublisher
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated
import java.util.UUID

@Service
@Validated
class CreateSubmissionService(
    private val attachmentRepository: AttachmentRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
    private val submissionRepository: SubmissionRepository,
    private val transactionalEventPublisher: TransactionalEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun create(
        memberId: UUID,
        problemId: UUID,
        @Valid inputDTO: CreateSubmissionInputDTO,
    ): Submission {
        logger.info("Creating submission for member with id: $memberId and problem with id: $problemId")

        val member =
            memberRepository.findById(memberId).orElseThrow {
                NotFoundException("Could not find member with id = $memberId")
            }
        val problem =
            problemRepository.findById(problemId).orElseThrow {
                NotFoundException("Could not find problem with id = $problemId")
            }
        val code =
            attachmentRepository.findById(inputDTO.code.id).orElseThrow {
                NotFoundException("Could not find code attachment with id = ${inputDTO.code.id}")
            }
        val contest = problem.contest

        if (problem.contest != member.contest) {
            throw ForbiddenException("Member does not belong to the contest of the problem")
        }
        if (contest.languages.none { it == inputDTO.language }) {
            throw ForbiddenException("Language ${inputDTO.language} is not allowed for this contest")
        }
        if (!contest.isActive()) {
            throw ForbiddenException("Contest is not active")
        }

        val submission =
            Submission(
                member = member,
                problem = problem,
                language = inputDTO.language,
                status = Submission.Status.JUDGING,
                code = code,
            )
        submissionRepository.save(submission)
        transactionalEventPublisher.publish(SubmissionEvent(this, submission))
        transactionalEventPublisher.publish(SubmissionJudgeEvent(this, submission))
        logger.info("Submission created, enqueued and emitted")
        return submission
    }
}
