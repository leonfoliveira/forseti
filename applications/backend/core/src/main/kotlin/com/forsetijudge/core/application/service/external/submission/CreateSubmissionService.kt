package com.forsetijudge.core.application.service.external.submission

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.freeze
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.external.submission.CreateSubmissionUseCase
import jakarta.validation.Valid
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateSubmissionService(
    private val attachmentRepository: AttachmentRepository,
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
    private val submissionRepository: SubmissionRepository,
    private val frozenSubmissionRepository: FrozenSubmissionRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : CreateSubmissionUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(
        @Valid command: CreateSubmissionUseCase.Command,
    ): Submission {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Creating submission for member with id: $contextMemberId and problem with id: ${command.problemId}")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest for member with id = $contextMemberId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberType(Member.Type.CONTESTANT)
            .requireContestActive()
            .throwIfErrors()

        val problem =
            problemRepository.findByIdAndContestId(command.problemId, contextContestId)
                ?: throw NotFoundException("Could not find problem with id = ${command.problemId} in contest")
        val code =
            attachmentRepository.findByIdAndContestId(command.code.id, contextContestId)
                ?: throw NotFoundException("Could not find code attachment with id = ${command.code.id} in contest")

        if (code.context != Attachment.Context.SUBMISSION_CODE) {
            throw ForbiddenException("Attachment with id = ${command.code.id} is not a submission code")
        }

        if (contest.languages.none { it == command.language }) {
            throw ForbiddenException("Language ${command.language} is not allowed for this contest")
        }

        code.isCommited = true
        val submission =
            Submission(
                member = member,
                problem = problem,
                language = command.language,
                status = Submission.Status.JUDGING,
                code = code,
            )
        submissionRepository.save(submission)
        frozenSubmissionRepository.save(submission.freeze())
        applicationEventPublisher.publishEvent(SubmissionEvent.Created(submission))

        logger.info("Submission created")
        return submission
    }
}
