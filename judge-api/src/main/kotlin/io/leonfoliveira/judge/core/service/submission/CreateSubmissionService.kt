package io.leonfoliveira.judge.core.service.submission

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.event.SubmissionJudgeEvent
import io.leonfoliveira.judge.core.event.SubmissionStatusUpdatedEvent
import io.leonfoliveira.judge.core.repository.AttachmentRepository
import io.leonfoliveira.judge.core.repository.MemberRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.leonfoliveira.judge.core.repository.SubmissionRepository
import io.leonfoliveira.judge.core.service.dto.input.CreateSubmissionInputDTO
import io.leonfoliveira.judge.core.util.TransactionalEventPublisher
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
        @Valid inputDTO: CreateSubmissionInputDTO,
    ): Submission {
        logger.info("Creating submission for member with id: $memberId and problem with id: ${inputDTO.problemId}")

        val member =
            memberRepository.findById(memberId).orElseThrow {
                NotFoundException("Could not find member with id = $memberId")
            }
        val problem =
            problemRepository.findById(inputDTO.problemId).orElseThrow {
                NotFoundException("Could not find problem with id = ${inputDTO.problemId}")
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
        transactionalEventPublisher.publish(SubmissionStatusUpdatedEvent(this, submission))
        transactionalEventPublisher.publish(SubmissionJudgeEvent(this, submission))
        logger.info("Submission created, enqueued and emitted")
        return submission
    }
}
