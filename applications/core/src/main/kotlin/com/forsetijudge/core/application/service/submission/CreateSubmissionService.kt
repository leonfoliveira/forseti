package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.application.helper.attachment.AttachmentCommiter
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.submission.SubmissionWithCodeResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseBodyDTO
import com.forsetijudge.core.port.input.usecase.submission.CreateSubmissionUseCase
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.ProblemRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import jakarta.validation.Valid
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateSubmissionService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val problemRepository: ProblemRepository,
    private val submissionRepository: SubmissionRepository,
    private val attachmentCommiter: AttachmentCommiter,
    private val businessEventPublisher: BusinessEventPublisher,
) : CreateSubmissionUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Creates a new submission for a member in a contest.
     *
     * @param command The command containing the details of the submission to be created.
     * @return The result of the submission creation, including the submission details and code.
     */
    @Transactional
    override fun execute(
        @Valid command: CreateSubmissionUseCase.Command,
    ): SubmissionWithCodeResponseBodyDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Creating submission for member with id: $contextMemberId and problem with id: ${command.problemId}")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest for member with id = $contextMemberId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.CONTESTANT)
            .requireContestActive()
            .throwIfErrors()

        val problem =
            problemRepository.findByIdAndContestId(command.problemId, command.contestId)
                ?: throw NotFoundException("Could not find problem with id = ${command.problemId} in contest")
        val code =
            attachmentCommiter.commit(
                attachmentId = command.code.id,
                contestId = command.contestId,
                context = Attachment.Context.SUBMISSION_CODE,
            )

        if (contest.languages.none { it == command.language }) {
            throw ForbiddenException("Language ${command.language} is not allowed for this contest")
        }

        val submission =
            Submission(
                member = member,
                problem = problem,
                language = command.language,
                status = Submission.Status.JUDGING,
                code = code,
            )
        submissionRepository.save(submission)
        businessEventPublisher.publish(SubmissionEvent.Created(submission.id))

        logger.info("Submission created successfully with id = ${submission.id}")
        return submission.toWithCodeResponseBodyDTO()
    }
}
